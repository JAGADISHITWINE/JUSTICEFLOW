const { query } = require('../../database/db');
const LocalSummarizer = require('./local-summarizer.service');
const path = require('path');
const fs = require('fs');

const STOPWORDS = new Set([
  'a','about','above','after','again','against','all','am','an','and','any','are','aren\'t','as','at','be','because',
  'been','before','being','below','between','both','but','by','can','can\'t','cannot','could','couldn\'t','did','didn\'t',
  'do','does','doesn\'t','doing','don\'t','down','during','each','few','for','from','further','had','hadn\'t','has','hasn\'t',
  'have','haven\'t','having','he','he\'d','he\'ll','he\'s','her','here','here\'s','hers','herself','him','himself','his',
  'how','how\'s','i','i\'d','i\'ll','i\'m','i\'ve','if','in','into','is','isn\'t','it','it\'s','its','itself','let\'s',
  'me','more','most','mustn\'t','my','myself','no','nor','not','of','off','on','once','only','or','other','ought','our',
  'ours','ourselves','out','over','own','same','shan\'t','she','she\'d','she\'ll','she\'s','should','shouldn\'t','so',
  'some','such','than','that','that\'s','the','their','theirs','them','themselves','then','there','there\'s','these',
  'they','they\'d','they\'ll','they\'re','they\'ve','this','those','through','to','too','under','until','up','very',
  'was','wasn\'t','we','we\'d','we\'ll','we\'re','we\'ve','were','weren\'t','what','what\'s','when','when\'s','where',
  'where\'s','which','while','who','who\'s','whom','why','why\'s','with','won\'t','would','wouldn\'t','you','you\'d',
  'you\'ll','you\'re','you\'ve','your','yours','yourself','yourselves'
]);

class CaseRagService {
  /**
   * Tokenize text and clean stop words
   */
  static cleanTokens(text) {
    return (text.toLowerCase().match(/[a-z0-9]+/g) || []).filter(t => !STOPWORDS.has(t) && t.length > 2);
  }

  static safeJsonParse(val, fallback = []) {
    if (!val) return fallback;
    if (typeof val === 'object') return Array.isArray(val) ? val : fallback;
    try {
      return JSON.parse(val);
    } catch (e) {
      if (typeof val === 'string' && val.includes(',')) {
        return val.split(',').map(s => s.trim());
      }
      return fallback;
    }
  }

  /**
   * Cosine similarity between token bags
   */
  static tokenCosineSimilarity(tokensA, tokensB) {
    if (!tokensA || !tokensB || tokensA.length === 0 || tokensB.length === 0) return 0;
    const union = new Set([...tokensA, ...tokensB]);
    let dot = 0, normA = 0, normB = 0;
    for (const t of union) {
      const cA = tokensA.filter(x => x === t).length;
      const cB = tokensB.filter(x => x === t).length;
      dot += cA * cB;
      normA += cA * cA;
      normB += cB * cB;
    }
    return (normA > 0 && normB > 0) ? dot / (Math.sqrt(normA) * Math.sqrt(normB)) : 0;
  }

  /**
   * Indexes a document's chunks into case_document_chunks with client_id
   */
  static async indexDocument(documentId, caseId, text, clientId = null) {
    if (!text || !text.trim()) return;

    // Resolve client_id if not supplied
    if (!clientId) {
      const cRow = await query('SELECT client_id FROM cases WHERE id = ?', [caseId]);
      clientId = cRow[0]?.client_id || null;
    }

    // Check if already indexed
    const existing = await query('SELECT COUNT(*) as cnt FROM case_document_chunks WHERE document_id = ?', [documentId]);
    if (existing[0]?.cnt > 0) {
      return; // Already indexed
    }

    // Split into semantic paragraphs / chunks (~150 words)
    const paragraphs = text
      .split(/\n\s*\n+/)
      .map(p => p.replace(/\s+/g, ' ').trim())
      .filter(p => p.length > 40);

    let chunkIndex = 0;
    for (const para of paragraphs) {
      const tokens = this.cleanTokens(para);
      if (tokens.length < 5) continue;

      // Extract entities & dates in this chunk
      const dates = para.match(/\b(?:\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*(?:\s+\d{2,4})?)\b/gi) || [];
      const entities = (para.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b/g) || []).filter(e => !STOPWORDS.has(e.toLowerCase()));

      await query(
        `INSERT INTO case_document_chunks (case_id, client_id, document_id, chunk_index, chunk_text, embedding, entities, dates)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          caseId,
          clientId,
          documentId,
          chunkIndex++,
          para,
          JSON.stringify(tokens),
          JSON.stringify([...new Set(entities)].slice(0, 5)),
          JSON.stringify([...new Set(dates)].slice(0, 5))
        ]
      );
    }
  }

  /**
   * Client-Aware & Case-Aware RAG Analysis
   * Compares the target document against other documents in the same case OR across the entire client portfolio.
   *
   * @param {number|string} documentId
   * @param {object} options { scope: 'client' | 'case' }
   */
  static async analyzeDocumentWithCaseMemory(documentId, options = {}) {
    const startTime = Date.now();
    const scope = (options.scope === 'case') ? 'case' : 'client'; // default to client-wide intelligence

    // 1. Fetch document, case, and client details
    const docRows = await query(
      `SELECT d.*, c.case_name, c.case_number, c.court_name, c.status as case_status,
              c.client_id, c.adverse_party, c.opposing_counsel,
              cl.name as client_name, cl.email as client_email, cl.phone as client_phone
       FROM documents d
       JOIN cases c ON d.case_id = c.id
       LEFT JOIN clients cl ON c.client_id = cl.id
       WHERE d.id = ?`,
      [documentId]
    );

    if (!docRows.length) {
      throw new Error('Document not found in repository.');
    }

    const doc = docRows[0];
    const caseId = doc.case_id;
    const clientId = doc.client_id;
    const clientName = doc.client_name || 'Designated Client';

    // 2. Fetch all cases belonging to this client
    let clientCases = [];
    if (clientId) {
      clientCases = await query(
        `SELECT id, case_name, case_number, court_name, adverse_party, status, case_type
         FROM cases
         WHERE client_id = ?
         ORDER BY id DESC`,
        [clientId]
      );
    } else {
      clientCases = [{
        id: caseId,
        case_name: doc.case_name,
        case_number: doc.case_number,
        court_name: doc.court_name,
        adverse_party: doc.adverse_party,
        status: doc.case_status,
        case_type: 'General Litigation'
      }];
    }

    // 3. Extract Document Text
    const diskPath = path.join(__dirname, '../uploads', path.basename(doc.file_path));
    let rawText = '';
    if (fs.existsSync(diskPath)) {
      rawText = await LocalSummarizer.extractTextFromFile(diskPath, doc.doc_name);
    }

    if (!rawText || !rawText.trim()) {
      rawText = `CLIENT MATTER RECORD: Client ${clientName}. Case: ${doc.case_name} (${doc.case_number}). Document: ${doc.doc_name}. Court: ${doc.court_name}. Adverse Party: ${doc.adverse_party || 'Opposing Party'}. Evidentiary submissions under Indian Practice OS.`;
    }

    // 4. Ensure document is indexed into memory
    await this.indexDocument(documentId, caseId, rawText, clientId);

    // 5. Standalone Algorithmic Analysis of current document
    const standalone = LocalSummarizer.process(rawText, doc.doc_name);

    // 6. Query other documents and past chunks based on selected scope
    let pastChunks = [];
    let otherDocs = [];

    if (scope === 'client' && clientId) {
      // Query across ALL cases of this client
      pastChunks = await query(
        `SELECT c.*, d.doc_name, ca.id as case_id, ca.case_name, ca.case_number, ca.adverse_party
         FROM case_document_chunks c
         JOIN documents d ON c.document_id = d.id
         JOIN cases ca ON c.case_id = ca.id
         WHERE c.client_id = ? AND c.document_id != ?`,
        [clientId, documentId]
      );

      otherDocs = await query(
        `SELECT d.id, d.case_id, d.doc_name, d.doc_type, d.uploaded_at, ca.case_name, ca.case_number
         FROM documents d
         JOIN cases ca ON d.case_id = ca.id
         WHERE ca.client_id = ? AND d.id != ?
         ORDER BY d.uploaded_at ASC`,
        [clientId, documentId]
      );
    } else {
      // Limit to same case docket
      pastChunks = await query(
        `SELECT c.*, d.doc_name, ca.id as case_id, ca.case_name, ca.case_number, ca.adverse_party
         FROM case_document_chunks c
         JOIN documents d ON c.document_id = d.id
         JOIN cases ca ON c.case_id = ca.id
         WHERE c.case_id = ? AND c.document_id != ?`,
        [caseId, documentId]
      );

      otherDocs = await query(
        `SELECT d.id, d.case_id, d.doc_name, d.doc_type, d.uploaded_at, ca.case_name, ca.case_number
         FROM documents d
         JOIN cases ca ON d.case_id = ca.id
         WHERE d.case_id = ? AND d.id != ?
         ORDER BY d.uploaded_at ASC`,
        [caseId, documentId]
      );
    }

    const currentChunks = await query(
      `SELECT * FROM case_document_chunks WHERE document_id = ?`,
      [documentId]
    );

    // 7. Cross-Document Similarity & Contradiction Retrieval
    const crossReferences = [];
    const contradictionFlags = [];

    for (const cur of currentChunks) {
      const curTokens = this.safeJsonParse(cur.embedding, []);

      for (const past of pastChunks) {
        const pastTokens = this.safeJsonParse(past.embedding, []);
        const sim = this.tokenCosineSimilarity(curTokens, pastTokens);

        if (sim > 0.26) {
          const isCrossCase = past.case_id !== caseId;

          crossReferences.push({
            current_excerpt: cur.chunk_text.substring(0, 220) + '...',
            past_document: past.doc_name,
            past_excerpt: past.chunk_text.substring(0, 220) + '...',
            case_id: past.case_id,
            case_name: past.case_name,
            case_number: past.case_number,
            is_cross_case: isCrossCase,
            scope_badge: isCrossCase ? `Cross-Case (${past.case_number})` : 'Same Case Docket',
            relevance_score: Math.round(sim * 100)
          });

          // Check for Contradiction Patterns (Conflicting assertions)
          const curLower = cur.chunk_text.toLowerCase();
          const pastLower = past.chunk_text.toLowerCase();

          const hasCurDenial = /(?:never|denied|failed|refused|not|no|disputed|void|breach|default)\b/.test(curLower);
          const hasPastAdmission = /(?:admitted|received|agreed|accepted|confirmed|duly|paid|cleared)\b/.test(pastLower);

          const hasPastDenial = /(?:never|denied|failed|refused|not|no|disputed|void|breach|default)\b/.test(pastLower);
          const hasCurAdmission = /(?:admitted|received|agreed|accepted|confirmed|duly|paid|cleared)\b/.test(curLower);

          if ((hasCurDenial && hasPastAdmission) || (hasPastDenial && hasCurAdmission)) {
            contradictionFlags.push({
              severity: isCrossCase ? 'High - Cross-Case Precedent Inconsistency' : 'High - Direct Factual Discrepancy',
              is_cross_case: isCrossCase,
              source_case: `${past.case_name} (${past.case_number})`,
              topic: isCrossCase 
                ? `Conflict between current claim and prior verified position in ${past.case_number}`
                : 'Direct factual discrepancy detected within case docket',
              current_claim: cur.chunk_text.substring(0, 250),
              prior_inconsistent_statement: `Prior statement in [${past.case_number}] ${past.doc_name}: "${past.chunk_text.substring(0, 250)}"`,
              advocate_tactic: isCrossCase
                ? `Impeach credibility by confronting opponent with earlier sworn records from ${past.case_number}. Apply Doctrine of Judicial Admissions / Issue Estoppel.`
                : 'Formulate cross-examination question confronting opposing deponent with this prior inconsistent record under Indian Evidence Act.'
            });
          }
        }
      }
    }

    // Deduplicate cross-references and take top 5
    const uniqueRefs = crossReferences
      .sort((a, b) => b.relevance_score - a.relevance_score)
      .slice(0, 5);

    // 8. Synthesize Master Chronological Timeline
    let timelineChunksQuery = '';
    let timelineParams = [];

    if (scope === 'client' && clientId) {
      timelineChunksQuery = `
        SELECT c.dates, d.doc_name, c.chunk_text, ca.case_name, ca.case_number
        FROM case_document_chunks c
        JOIN documents d ON c.document_id = d.id
        JOIN cases ca ON c.case_id = ca.id
        WHERE c.client_id = ?
      `;
      timelineParams = [clientId];
    } else {
      timelineChunksQuery = `
        SELECT c.dates, d.doc_name, c.chunk_text, ca.case_name, ca.case_number
        FROM case_document_chunks c
        JOIN documents d ON c.document_id = d.id
        JOIN cases ca ON c.case_id = ca.id
        WHERE c.case_id = ?
      `;
      timelineParams = [caseId];
    }

    const allChunksForTimeline = await query(timelineChunksQuery, timelineParams);
    const masterTimeline = [];
    const seenDates = new Set();

    for (const row of allChunksForTimeline) {
      const dates = this.safeJsonParse(row.dates, []);
      for (const d of dates) {
        if (!seenDates.has(d)) {
          seenDates.add(d);
          masterTimeline.push({
            date_reference: d,
            case_number: row.case_number,
            case_name: row.case_name,
            source_document: row.doc_name,
            event_context: row.chunk_text.substring(0, 160) + '...'
          });
        }
      }
    }

    // 9. Generate Tactical Strategy for Countering the Opposing Party
    const counterTactics = [];
    if (contradictionFlags.length > 0) {
      const hasCross = contradictionFlags.some(c => c.is_cross_case);
      counterTactics.push({
        tactic_type: hasCross ? 'Cross-Matter Precedent Ammunition' : 'Cross-Examination Ammunition',
        title: hasCross ? 'Expose Opponent Shift Across Client Matters' : 'Impeach on Prior Inconsistent Record',
        recommendation: hasCross
          ? `Opposing party or contractor has taken contradictory stances between ${doc.case_number} and earlier client matter. File application to place earlier records on record under Code of Civil Procedure.`
          : `Opposing deponent has contradicted earlier filings. Formulate cross-examination questions to confront deponent under Section 145/155 of Evidence Act.`
      });
    }

    if (clientCases.length > 1) {
      counterTactics.push({
        tactic_type: 'Client Portfolio Defense',
        title: 'Multi-Case Exposure Shield',
        recommendation: `Client has ${clientCases.length} active litigation matters. Ensure discovery responses in this case do not prejudice client position in related matter ${clientCases.find(c => c.id !== caseId)?.case_number || ''}.`
      });
    }

    counterTactics.push({
      tactic_type: 'Limitation & Admissions Audit',
      title: 'Statutory Verification',
      recommendation: 'Verify dates against client master chronology to assert plea of limitation or estoppel against counter-party claims.'
    });

    const adverseParties = [...new Set(clientCases.map(c => c.adverse_party).filter(Boolean))];
    const processingTime = Date.now() - startTime;

    return {
      success: true,
      data: {
        document_id: documentId,
        scope: scope,
        client: {
          id: clientId,
          name: clientName,
          email: doc.client_email,
          total_cases: clientCases.length,
          all_cases: clientCases.map(c => ({
            id: c.id,
            case_name: c.case_name,
            case_number: c.case_number,
            adverse_party: c.adverse_party,
            status: c.status
          })),
          adverse_parties: adverseParties
        },
        case_info: {
          id: caseId,
          case_name: doc.case_name,
          case_number: doc.case_number,
          court_name: doc.court_name,
          adverse_party: doc.adverse_party
        },
        current_document: doc.doc_name,
        total_scope_documents: otherDocs.length + 1,
        total_scope_chunks: pastChunks.length,
        processing_time_ms: processingTime,
        rag_memory_status: scope === 'client'
          ? `Cross-analyzed against full client history: ${clientCases.length} case(s), ${otherDocs.length} prior document(s), & ${pastChunks.length} historical chunks.`
          : `Analyzed within case docket: ${otherDocs.length} prior document(s) & ${pastChunks.length} chunks.`,
        standalone_brief: standalone?.data,
        case_memory_cross_references: uniqueRefs,
        contradiction_alerts: contradictionFlags.slice(0, 4),
        cumulative_case_timeline: masterTimeline.slice(0, 10),
        counter_party_tactical_strategy: counterTactics
      }
    };
  }

  /**
   * Client-Level 360° Legal Intelligence Dossier
   * Synthesizes all cases, documents, adverse parties, and chronological history for an entire client.
   *
   * @param {number|string} clientId
   */
  static async getClientIntelligence(clientId) {
    const startTime = Date.now();

    // 1. Fetch Client Profile
    const clientRows = await query('SELECT * FROM clients WHERE id = ?', [clientId]);
    if (!clientRows.length) {
      throw new Error(`Client ID ${clientId} not found.`);
    }
    const client = clientRows[0];

    // 2. Fetch all cases of this client
    const cases = await query(
      `SELECT * FROM cases WHERE client_id = ? ORDER BY id DESC`,
      [clientId]
    );

    // 3. Fetch all documents of this client
    const docs = await query(
      `SELECT d.*, c.case_name, c.case_number
       FROM documents d
       JOIN cases c ON d.case_id = c.id
       WHERE c.client_id = ?
       ORDER BY d.uploaded_at DESC`,
      [clientId]
    );

    // 4. Fetch all chunks indexed for this client
    const chunks = await query(
      `SELECT c.*, d.doc_name, ca.case_name, ca.case_number
       FROM case_document_chunks c
       JOIN documents d ON c.document_id = d.id
       JOIN cases ca ON c.case_id = ca.id
       WHERE c.client_id = ?`,
      [clientId]
    );

    // 5. Aggregate Master Timeline across all client matters
    const clientTimeline = [];
    const seenDates = new Set();
    for (const chunk of chunks) {
      const dates = this.safeJsonParse(chunk.dates, []);
      for (const d of dates) {
        if (!seenDates.has(d)) {
          seenDates.add(d);
          clientTimeline.push({
            date: d,
            case_number: chunk.case_number,
            case_name: chunk.case_name,
            source_document: chunk.doc_name,
            context: chunk.chunk_text.substring(0, 150) + '...'
          });
        }
      }
    }

    const adverseParties = [...new Set(cases.map(c => c.adverse_party).filter(Boolean))];

    return {
      success: true,
      data: {
        client_id: client.id,
        client_name: client.name,
        client_email: client.email,
        total_cases: cases.length,
        total_documents: docs.length,
        total_indexed_chunks: chunks.length,
        cases_portfolio: cases.map(c => ({
          id: c.id,
          name: c.case_name,
          number: c.case_number,
          court: c.court_name,
          status: c.status,
          adverse_party: c.adverse_party
        })),
        adverse_parties_encountered: adverseParties,
        processing_time_ms: Date.now() - startTime,
        master_client_timeline: clientTimeline.slice(0, 15)
      }
    };
  }

  /**
   * Aggregates all chronological dates across all files in a case
   */
  static async getCaseMasterTimeline(caseId) {
    const rows = await query(
      `SELECT c.dates, d.doc_name, c.chunk_text, ca.case_name, ca.case_number
       FROM case_document_chunks c
       JOIN documents d ON c.document_id = d.id
       JOIN cases ca ON c.case_id = ca.id
       WHERE c.case_id = ?`,
      [caseId]
    );

    const timeline = [];
    const seen = new Set();
    for (const r of rows) {
      const dates = this.safeJsonParse(r.dates, []);
      for (const d of dates) {
        if (!seen.has(d)) {
          seen.add(d);
          timeline.push({
            date: d,
            case_number: r.case_number,
            document: r.doc_name,
            context: r.chunk_text.substring(0, 200) + '...'
          });
        }
      }
    }
    return timeline;
  }
}

module.exports = CaseRagService;
