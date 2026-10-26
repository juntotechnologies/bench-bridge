# Video Script: Bench Bridge Demo

Target length: 2.5–3 minutes. Audience: lab directors at DEA-registered, FDA-regulated test labs.

Every figure and name below is generated from the sources: `shared/data/devices.json`, `server/data/ledger.json` and the pipeline itself.
Run `npm run docs` after a change. `npm run lint` fails when this file is stale.

## Before You Record

- Run `npm run dev` and open the one tailnet link it prints. Use a 1600 × 960 window or larger.
- Select the <!-- gen:fact balance.name -->Analytical balance<!-- /gen -->. Set the drawing to **Exploded** with **Labels** on.
- Reload the page, so the pipeline strip shows no run.

## Script

| # | Screen action | What to say |
|---|---|---|
| 1 | Full screen, no clicks | "Most regulated labs have instruments that still work well but cannot talk to the LIMS. The data ends up on paper, then someone types it in." |
| 2 | Point to the catalogue on the left | "These are the <!-- gen:fact catalog.count -->11<!-- /gen --> older instruments a DEA-registered test lab usually runs. <!-- gen:fact catalog.live -->1<!-- /gen --> is live today: the <!-- gen:fact balance.name -->Analytical balance<!-- /gen -->. The other <!-- gen:fact catalog.planned -->10<!-- /gen --> are planned. Each one has an output port. The data is there, but it is in a format the LIMS cannot take." |
| 3 | Point to the balance card | "I start with the <!-- gen:fact balance.name -->Analytical balance<!-- /gen -->, because every controlled-substance weigh-out has to match the CS ledger. That is the record the DEA audits." |
| 4 | Drag the spacing slider to Assembled, then back to Exploded | "This is a <!-- gen:fact balance.era -->1994<!-- /gen --> balance with a serial print port. The orange part is the bridge: <!-- gen:fact balance.kit -->Serial tap with DB9 pass-through<!-- /gen -->. It plugs into the existing <!-- gen:fact balance.port.connector -->DB9 male<!-- /gen --> port. It does not change the balance, its firmware or its settings." |
| 5 | Open the **Overview** tab | "Read the Today column: <!-- gen:fact balance.today.count -->3<!-- /gen --> manual steps, and each one can go wrong. The analyst copies, types, and someone updates the ledger later." |
| 6 | Open the **Port** tab | "The tap reads the balance's own print output: <!-- gen:fact balance.port.settings -->2400 baud · 7E1 · no flow control<!-- /gen -->, on <!-- gen:fact balance.port.pins -->3<!-- /gen --> pins. It uses what the instrument already sends. No driver on a PC is needed, so a LIMS or Windows update cannot break it." |
| 7 | Press **Run bridge**. Stay on the **Data** tab | "Here is a real weigh-by-difference. The balance prints <!-- gen:fact balance.run.lines -->5<!-- /gen --> lines. The bridge stamps the time on every line as it arrives." |
| 8 | Point to the struck-out rows | "<!-- gen:fact balance.run.unstable -->3<!-- /gen --> of those readings are marked D: still moving, so the bridge drops them. <!-- gen:fact balance.run.stable -->2<!-- /gen --> are stable and count, the same rule an analyst follows." |
| 9 | Point to the result card | "The first stable weight, <!-- gen:fact balance.run.first -->25.4821<!-- /gen --> <!-- gen:fact balance.run.unit -->g<!-- /gen -->, less the last, <!-- gen:fact balance.run.last -->25.3617<!-- /gen --> <!-- gen:fact balance.run.unit -->g<!-- /gen -->, is <!-- gen:fact balance.run.used -->0.1204<!-- /gen --> <!-- gen:fact balance.run.unit -->g<!-- /gen --> used. The bridge does the arithmetic, so nobody types a number." |
| 10 | The app opens the **Deliver** tab | "That one reading becomes two records: a sample result in the LIMS, and a use entry in the controlled-substance ledger." |
| 11 | Point to the ledger card | "Look at the ledger card: <!-- gen:fact balance.ledger.substance -->Codeine phosphate reference standard<!-- /gen -->, schedule <!-- gen:fact balance.ledger.schedule -->II<!-- /gen -->, goes from <!-- gen:fact balance.ledger.opening -->1.8735<!-- /gen --> <!-- gen:fact balance.ledger.unit -->g<!-- /gen --> to <!-- gen:fact balance.ledger.closing -->1.7531<!-- /gen --> <!-- gen:fact balance.ledger.unit -->g<!-- /gen -->. The ledger and the instrument now agree, and the analyst wrote nothing down." |
| 12 | Point to the receipts | "Each system sends back a receipt: <!-- gen:fact balance.receipt.lims -->RES-000001<!-- /gen --> for the LIMS and <!-- gen:fact balance.receipt.ledger -->CSU-000001<!-- /gen --> for the ledger. If a required field is missing, the record is rejected and the screen names the field. It never fails silently." |
| 13 | Point back to the catalogue | "The same pattern works for each instrument: read its native output, parse it, apply the lab's rules, then deliver it to the systems the lab already uses. The LIMS stays the system of record. The bridge is a small part that you can test on its own." |
| 14 | End on the full screen | "If your lab has an instrument that still makes paper, I want to hear which one. That is the next one I build." |

## Credibility Rules

- Say "designed to support validation". Never say "Part 11 compliant" or "validated".
- Say "the DEA audits the CS ledger". Do not say the DEA receives this data.
- Say "prototype" or "demo" one time, near the start or the end.
- Say "in this demo" when you give a figure. The containers and weights are sample data.
- Say the ledger is a demo: it keeps no state, and every run starts from the same opening balance. A database comes later.
- The bridge does not replace the LIMS, the CDS or the ERP. It moves data into them.

## Likely Questions

| Question | Short answer |
|---|---|
| Is this Part 11 compliant? | Not yet. The design keeps the raw output, stamps the time on each line, and leaves the LIMS as the system of record. Validation (IQ/OQ/PQ) comes with each install. |
| What if our LIMS vendor updates? | The bridge talks to the LIMS through its import interface. The instrument side does not change, so only that one mapping needs a retest. |
| Do you change the instrument? | No. The tap reads the port the instrument already has. |
| What about HPLC and GC-MS? | They are next in the catalogue. Their problem is old chromatography software, which loses driver support after updates. |
| Does it store the data? | Not in this demo. The ledger resets on every run. A database (SQLite or hosted) is the next step, behind one module. |
| What does a pilot look like? | One instrument, one lab, one data path from end to end, tested against your acceptance criteria. |

## Terms

| Term | Meaning |
|---|---|
| LIMS | Laboratory information management system: the system of record for samples and results |
| CS ledger | The running record of each controlled-substance container, as 21 CFR 1304 requires |
| CDS | Chromatography data system: the software that runs an HPLC or GC |
| Weigh by difference | Weigh the container before and after you remove material. The difference is the amount used. |
| IQ/OQ/PQ | Installation, operational and performance qualification: the steps that validate a system |
