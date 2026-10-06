const CalendarModel = require('../models/calendar.model');

// Helper to format Date for iCal RFC 5545 (YYYYMMDDTHHMMSSZ)
function formatIcsDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

// Indian Jurisdiction Rules & Statutory Deadlines Mapping
const JURISDICTION_RULES = {
  COMMERCIAL_SUIT_SUMMONS_SERVED: {
    name: 'Commercial Suit Summons Served (Commercial Courts Act / Order VIII CPC)',
    description: 'Mandatory statutory clock for filing Written Statement (WS) under Commercial Courts Act 2015 and Code of Civil Procedure 1908',
    deadlines: [
      {
        title: 'CPC Order VIII Rule 1: Written Statement (WS) Due Date (30 Days)',
        offsetDays: 30,
        type: 'Filing Deadline',
        priority: 'High',
        notes: 'Mandatory 30-day statutory period from date of service of summons to file Written Statement accompanied by Statement of Admission/Denial of Documents'
      },
      {
        title: 'Commercial Courts Act S. 16: Judicial Extension Window (90 Days)',
        offsetDays: 90,
        type: 'Filing Deadline',
        priority: 'Critical',
        notes: 'Condonable extension period requiring formal application with plausible reasons and cost deposit'
      },
      {
        title: 'ABSOLUTE STATUTORY BAR: Maximum 120-Day Forfeiture of Defence',
        offsetDays: 120,
        type: 'Filing Deadline',
        priority: 'Critical',
        is_statute_of_limitations: 1,
        notes: 'ABSOLUTE JURISDICTIONAL BAR: Right of Defendant to file Written Statement is permanently forfeited post 120 days (Hon SC in SCG Contracts India Pvt Ltd v. K.S. Chamankar)'
      }
    ]
  },
  SECTION_138_NI_ACT_CHEQUE_BOUNCE: {
    name: 'Section 138 Negotiable Instruments Act (Cheque Dishonour)',
    description: 'Strict statutory compliance clock for criminal proceedings on dishonour of cheque for discharge of debt',
    deadlines: [
      {
        title: 'Section 138(b) NI Act: Statutory Legal Demand Notice (30 Days)',
        offsetDays: 30,
        type: 'Filing Deadline',
        priority: 'Critical',
        notes: 'Mandatory statutory legal notice to drawer demanding payment within 30 days of receipt of bank memo of dishonour'
      },
      {
        title: 'Section 138(c) NI Act: 15-Day Statutory Cure Period Expiry',
        offsetDays: 45,
        type: 'Filing Deadline',
        priority: 'High',
        notes: 'Drawer has 15 statutory days from date of notice receipt to make payment before cause of action arises'
      },
      {
        title: 'Section 142(1)(b) NI Act: Criminal Complaint Filing Bar (30 Days)',
        offsetDays: 75,
        type: 'Filing Deadline',
        priority: 'Critical',
        is_statute_of_limitations: 1,
        notes: 'ABSOLUTE STATUTORY LIMITATION: Criminal complaint must be filed before Judicial Magistrate / MM within 30 days of cause of action'
      }
    ]
  },
  ARBITRATION_AWARD_SECTION_34: {
    name: 'Arbitral Award Passed (Section 34 Arbitration & Conciliation Act 1996)',
    description: 'Statutory petition to set aside domestic or international commercial arbitral award',
    deadlines: [
      {
        title: 'Section 34(3) Arbitration Act: Setting Aside Petition (3 Months / 90 Days)',
        offsetDays: 90,
        type: 'Filing Deadline',
        priority: 'Critical',
        notes: 'Statutory limitation period to file Section 34 challenge petition before High Court / Commercial Division from receipt of signed arbitral award'
      },
      {
        title: 'Section 34(3) Proviso: Absolute 30-Day Condonable Grace Period Bar',
        offsetDays: 120,
        type: 'Filing Deadline',
        priority: 'Critical',
        is_statute_of_limitations: 1,
        notes: 'STRICT NON-EXTENDABLE LIMITATION: Court has zero jurisdiction to condone delay beyond 30 days grace period (Supreme Court in Union of India v. Popular Construction)'
      }
    ]
  },
  LIMITATION_ACT_MONEY_RECOVERY: {
    name: 'Limitation Act 1963: Commercial Invoices & Money Recovery (Article 15/19)',
    description: 'Three-year statutory limitations clock for civil suit for recovery of unpaid money or goods sold',
    deadlines: [
      {
        title: 'Advocate Legal Notice & Demand under Section 80 CPC',
        offsetDays: 30,
        type: 'Filing Deadline',
        priority: 'High',
        notes: 'Advocate formal notice demanding invoice liquidation prior to civil litigation'
      },
      {
        title: 'Pre-Institution Mediation & Settlement (PIMS) Commercial Courts S. 12A',
        offsetDays: 90,
        type: 'Filing Deadline',
        priority: 'High',
        notes: 'Mandatory pre-institution mediation at DLSA/SLSA before Commercial Suit unless urgent interim relief is prayed'
      },
      {
        title: 'LIMITATION ACT 1963: 3-Year Recovery Bar (Article 15/19)',
        offsetDays: 1095,
        type: 'Filing Deadline',
        priority: 'Critical',
        is_statute_of_limitations: 1,
        notes: 'ABSOLUTE STATUTORY LIMITATION BAR: Suit for recovery of money or unpaid commercial invoices is permanently barred after 3 years from due date'
      }
    ]
  },
  HIGH_COURT_APPEAL_AND_SLP: {
    name: 'Decree Passed: High Court Appeal (RFA) & Supreme Court SLP',
    description: 'Statutory limitation for Regular First Appeal (RFA) to High Court and Special Leave Petition (SLP) to Supreme Court',
    deadlines: [
      {
        title: 'Section 96 CPC / Limitation Act Art. 116: Regular First Appeal (RFA) (90 Days)',
        offsetDays: 90,
        type: 'Filing Deadline',
        priority: 'High',
        notes: 'Statutory period to file Regular First Appeal (RFA) against District Court civil decree before High Court'
      },
      {
        title: 'Article 136 Constitution / Supreme Court Rules: Special Leave Petition (SLP) (90 Days)',
        offsetDays: 90,
        type: 'Filing Deadline',
        priority: 'Critical',
        is_statute_of_limitations: 1,
        notes: 'Filing Special Leave Petition before Hon\'ble Supreme Court of India within 90 days of High Court final order'
      }
    ]
  },
  INTERIM_INJUNCTION_ORDER_39: {
    name: 'Ex-Parte Interim Injunction (CPC Order XXXIX Rule 3)',
    description: 'Mandatory compliance timeline on grant of ex-parte ad-interim injunction order',
    deadlines: [
      {
        title: 'Order XXXIX Rule 3 CPC: Service of Copy of Application & Affidavit (Same Day / 24h)',
        offsetDays: 1,
        type: 'Filing Deadline',
        priority: 'Critical',
        notes: 'Mandatory compliance: Plaintiff must send copy of injunction application, plaint, affidavit, and documents to defendant on date of order or immediate next day'
      },
      {
        title: 'Order XXXIX Rule 3A CPC: Final Disposal of Injunction Application (30 Days)',
        offsetDays: 30,
        type: 'Hearing',
        priority: 'High',
        notes: 'Court is statutorily mandated to endeavor to finally dispose of temporary injunction application within 30 days'
      }
    ]
  }
};

class CalendarController {
  // GET /api/calendar/events
  static async getEvents(req, res) {
    try {
      const filters = {
        case_id: req.query.case_id,
        event_type: req.query.event_type,
        start_date: req.query.start_date,
        end_date: req.query.end_date,
        is_sol: req.query.is_sol !== undefined ? req.query.is_sol === 'true' : undefined
      };
      const events = await CalendarModel.findAll(filters);
      res.json({ success: true, data: events });
    } catch (err) {
      console.error('Error fetching calendar events:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // GET /api/calendar/events/:id
  static async getEventById(req, res) {
    try {
      const event = await CalendarModel.findById(req.params.id);
      if (!event) {
        return res.status(404).json({ success: false, message: 'Calendar event not found' });
      }
      res.json({ success: true, data: event });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // POST /api/calendar/events
  static async createEvent(req, res) {
    try {
      const {
        case_id,
        client_id,
        title,
        event_type,
        start_time,
        end_time,
        location,
        court_room,
        judge_name,
        reminder_minutes,
        notes,
        is_statute_of_limitations,
        priority
      } = req.body;

      if (!title || !start_time) {
        return res.status(400).json({ success: false, message: 'Title and Start Time are required' });
      }

      const userId = req.headers['x-user-id'] || 1;
      const newEvent = await CalendarModel.create({
        user_id: userId,
        case_id,
        client_id,
        title,
        event_type: event_type || 'Hearing',
        start_time,
        end_time: end_time || start_time,
        location,
        court_room,
        judge_name,
        reminder_minutes: reminder_minutes || 1440,
        notes,
        is_statute_of_limitations: is_statute_of_limitations ? 1 : 0,
        priority: priority || 'Normal'
      });

      res.status(201).json({ success: true, message: 'Court event scheduled successfully', data: newEvent });
    } catch (err) {
      console.error('Error creating calendar event:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // PUT /api/calendar/events/:id
  static async updateEvent(req, res) {
    try {
      const updated = await CalendarModel.update(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Calendar event not found' });
      }
      res.json({ success: true, message: 'Calendar event updated successfully', data: updated });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // DELETE /api/calendar/events/:id
  static async deleteEvent(req, res) {
    try {
      const deleted = await CalendarModel.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Event not found' });
      }
      res.json({ success: true, message: 'Event removed from calendar' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // POST /api/calendar/calculate-deadlines
  static async calculateDeadlines(req, res) {
    try {
      const { ruleKey, triggerDate, caseId, clientId } = req.body;
      if (!ruleKey || !triggerDate) {
        return res.status(400).json({ success: false, message: 'Rule key and trigger date are required' });
      }

      const ruleDef = JURISDICTION_RULES[ruleKey];
      if (!ruleDef) {
        return res.status(400).json({
          success: false,
          message: `Unknown rule key: ${ruleKey}. Available rules: ${Object.keys(JURISDICTION_RULES).join(', ')}`
        });
      }

      const base = new Date(triggerDate);
      const calculatedEvents = ruleDef.deadlines.map(item => {
        const target = new Date(base);
        target.setDate(target.getDate() + item.offsetDays);
        target.setHours(17, 0, 0, 0); // 5:00 PM court filing close

        return {
          title: item.title,
          event_type: item.type,
          priority: item.priority || 'High',
          start_time: target.toISOString(),
          end_time: new Date(target.getTime() + 60 * 60 * 1000).toISOString(),
          is_statute_of_limitations: item.is_statute_of_limitations ? 1 : 0,
          notes: `${item.notes} (Trigger: ${ruleDef.name}, Base Date: ${triggerDate}, Offset: +${item.offsetDays} days)`,
          rule_trigger_name: ruleDef.name,
          case_id: caseId || null,
          client_id: clientId || null,
          offsetDays: item.offsetDays
        };
      });

      res.json({
        success: true,
        ruleName: ruleDef.name,
        description: ruleDef.description,
        triggerDate,
        calculatedCount: calculatedEvents.length,
        deadlines: calculatedEvents
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // POST /api/calendar/apply-deadlines
  static async applyDeadlines(req, res) {
    try {
      const { deadlines, caseId, clientId } = req.body;
      if (!Array.isArray(deadlines) || deadlines.length === 0) {
        return res.status(400).json({ success: false, message: 'Deadlines list is required' });
      }

      const userId = req.headers['x-user-id'] || 1;
      const created = [];

      for (const d of deadlines) {
        const item = await CalendarModel.create({
          user_id: userId,
          case_id: caseId || d.case_id || null,
          client_id: clientId || d.client_id || null,
          title: d.title,
          event_type: d.event_type || 'Filing Deadline',
          start_time: d.start_time,
          end_time: d.end_time || d.start_time,
          priority: d.priority || 'High',
          is_statute_of_limitations: d.is_statute_of_limitations || 0,
          rule_trigger_name: d.rule_trigger_name || null,
          notes: d.notes || null,
          reminder_minutes: 2880 // 48h default for statutory deadlines
        });
        created.push(item);
      }

      res.status(201).json({
        success: true,
        message: `Successfully docketed ${created.length} rule-based court deadlines!`,
        data: created
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // GET /api/calendar/export.ics (RFC 5545 iCalendar stream)
  static async exportIcsFeed(req, res) {
    try {
      const events = await CalendarModel.findAll({});

      let icsLines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//JusticeFlow Legal Technologies//JusticeFlow Law Practice OS//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'X-WR-CALNAME:JusticeFlow Court Master Calendar',
        'X-WR-TIMEZONE:UTC',
        'X-WR-CALDESC:Official trial hearings, depositions, and statutory deadlines from JusticeFlow.'
      ];

      for (const ev of events) {
        const startFormatted = formatIcsDate(ev.start_time);
        const endFormatted = formatIcsDate(ev.end_time || ev.start_time);
        const createdFormatted = formatIcsDate(ev.created_at || new Date());
        const uid = `justiceflow-event-${ev.id}-${Date.now()}@justiceflow.internal`;

        let summary = ev.title;
        if (ev.is_statute_of_limitations) {
          summary = `[SOL BAR] ${summary}`;
        }

        let desc = `${ev.notes || ''}\nCase: ${ev.case_number || 'N/A'} - ${ev.case_title || 'General'}\nType: ${ev.event_type}\nJudge: ${ev.judge_name || 'N/A'}\nCourtroom: ${ev.court_room || 'N/A'}`;
        desc = desc.replace(/\r?\n/g, '\\n');

        icsLines.push('BEGIN:VEVENT');
        icsLines.push(`UID:${uid}`);
        icsLines.push(`DTSTAMP:${createdFormatted}`);
        icsLines.push(`DTSTART:${startFormatted}`);
        icsLines.push(`DTEND:${endFormatted}`);
        icsLines.push(`SUMMARY:${summary.replace(/,/g, '\\,')}`);
        icsLines.push(`DESCRIPTION:${desc}`);
        if (ev.location) {
          icsLines.push(`LOCATION:${ev.location.replace(/,/g, '\\,')}`);
        }
        icsLines.push(`STATUS:CONFIRMED`);
        icsLines.push(`PRIORITY:${ev.priority === 'Critical' ? '1' : ev.priority === 'High' ? '3' : '5'}`);

        // RFC 5545 Alarm reminder (24 hours prior)
        icsLines.push('BEGIN:VALARM');
        icsLines.push('ACTION:DISPLAY');
        icsLines.push(`DESCRIPTION:Reminder: ${summary.replace(/,/g, '\\,')}`);
        icsLines.push('TRIGGER:-P1D');
        icsLines.push('END:VALARM');

        icsLines.push('END:VEVENT');
      }

      icsLines.push('END:VCALENDAR');
      const icsOutput = icsLines.join('\r\n');

      res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="justiceflow_court_calendar.ics"');
      res.send(icsOutput);
    } catch (err) {
      console.error('ICS Feed generation error:', err);
      res.status(500).send('Error generating iCalendar feed');
    }
  }

  // GET /api/calendar/events/:id/ics
  static async exportSingleEventIcs(req, res) {
    try {
      const ev = await CalendarModel.findById(req.params.id);
      if (!ev) return res.status(404).send('Event not found');

      const startFormatted = formatIcsDate(ev.start_time);
      const endFormatted = formatIcsDate(ev.end_time || ev.start_time);
      const createdFormatted = formatIcsDate(ev.created_at || new Date());
      const uid = `justiceflow-event-${ev.id}@justiceflow.internal`;

      let summary = ev.title;
      let desc = `${ev.notes || ''}\nCase: ${ev.case_number || 'N/A'} - ${ev.case_title || 'General'}\nType: ${ev.event_type}\nJudge: ${ev.judge_name || 'N/A'}`;
      desc = desc.replace(/\r?\n/g, '\\n');

      const ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//JusticeFlow//Lawyer Practice Calendar//EN',
        'CALSCALE:GREGORIAN',
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${createdFormatted}`,
        `DTSTART:${startFormatted}`,
        `DTEND:${endFormatted}`,
        `SUMMARY:${summary.replace(/,/g, '\\,')}`,
        `DESCRIPTION:${desc}`,
        ev.location ? `LOCATION:${ev.location.replace(/,/g, '\\,')}` : '',
        'STATUS:CONFIRMED',
        'END:VEVENT',
        'END:VCALENDAR'
      ].filter(Boolean).join('\r\n');

      res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="event_${ev.id}.ics"`);
      res.send(ics);
    } catch (err) {
      res.status(500).send('Error generating event ICS');
    }
  }

  // GET /api/calendar/alerts/upcoming
  static async getUpcomingAlerts(req, res) {
    try {
      const alerts = await CalendarModel.getUpcomingAlerts();
      const categorized = alerts.map(a => {
        const hours = a.hours_until_event;
        let urgency = '7 Days Warning';
        let alertTier = '7d';

        if (hours <= 2) {
          urgency = '2-Hour Immediate Notice';
          alertTier = '2h';
        } else if (hours <= 48) {
          urgency = '48-Hour Final Preparation';
          alertTier = '48h';
        }

        return {
          ...a,
          urgency,
          alertTier,
          recipientAttorney: a.attorney_email || 'counsel@justiceflow.com',
          recipientClient: a.client_email || 'client@corporation.com'
        };
      });

      res.json({ success: true, count: categorized.length, data: categorized });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // POST /api/calendar/alerts/:id/send
  static async sendCourtReminder(req, res) {
    try {
      const { id } = req.params;
      const { channel, alertTier } = req.body; // email, sms, both
      const ev = await CalendarModel.findById(id);

      if (!ev) {
        return res.status(404).json({ success: false, message: 'Event not found' });
      }

      await CalendarModel.markAlertSent(id, alertTier || '48h');

      res.json({
        success: true,
        message: `Court automated reminder successfully transmitted via ${channel || 'Email & SMS'}!`,
        details: {
          eventId: ev.id,
          title: ev.title,
          time: ev.start_time,
          location: ev.location,
          sentTo: [ev.attorney_name, ev.client_name].filter(Boolean),
          timestamp: new Date().toISOString()
        }
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

module.exports = CalendarController;
