# Video Script: Bench Bridge Demo

Target length: 3–4 minutes. Audience: lab directors at test labs registered with the <!-- gen:term DEA -->Drug Enforcement Administration (DEA)<!-- /gen --> and regulated by the <!-- gen:term FDA -->Food and Drug Administration (FDA)<!-- /gen -->.

Every figure and name below is generated from the sources: `shared/data/devices.json`, `server/data/ledger.json` and the pipeline itself.
Run `npm run docs` after a change. `npm run lint` fails when this file is stale.

## Before You Record

- Run `npm run dev` and open the one tailnet link it prints. Use a 1600 × 960 window or larger.
- Select the <!-- gen:fact balance.name -->Analytical balance<!-- /gen -->. Set the drawing to **Exploded** with **Labels** on.
- Reload the page, so the pipeline strip shows no run.

## Script

| # | Screen action | What to say |
|---|---|---|
| 1 | Full screen, no clicks | "Most regulated labs have instruments that still work well but cannot talk to the <!-- gen:term LIMS -->Laboratory Information Management System (LIMS)<!-- /gen -->. The data ends up on paper, then someone types it in." |
| 2 | Point to the catalogue on the left | "These are the <!-- gen:fact catalog.count -->13<!-- /gen --> older instruments a test lab registered with the <!-- gen:term DEA -->Drug Enforcement Administration (DEA)<!-- /gen --> usually runs. Live today: <!-- gen:spoken catalog.liveNames -->Analytical balance, High-Performance Liquid Chromatography (HPLC) system, Gas Chromatography (GC) system, Gas Chromatography-Mass Spectrometry (GC-MS), pH meter, Karl Fischer titrator, and Liquid Chromatography-Tandem Mass Spectrometry (LC-MS/MS)<!-- /gen -->. The other <!-- gen:fact catalog.planned -->6<!-- /gen --> are planned. Each one has an output port. The chips above the list filter them by connection: <!-- gen:fact catalog.connections -->RS-232, IEEE-488 (GPIB), and LAN<!-- /gen -->. Older instruments use a serial port or an instrument bus. Newer ones sit on the lab network. The data is there, but it is in a format the <!-- gen:term LIMS -->Laboratory Information Management System (LIMS)<!-- /gen --> cannot take." |
| 3 | Point to the balance card | "I start with the <!-- gen:fact balance.name -->Analytical balance<!-- /gen -->, because every controlled-substance weigh-out has to match the <!-- gen:term CS -->controlled-substance (CS)<!-- /gen --> ledger. That is the record the <!-- gen:term DEA -->Drug Enforcement Administration (DEA)<!-- /gen --> audits." |
| 4 | Drag the spacing slider to Assembled, then back to Exploded | "This is a <!-- gen:fact balance.era -->1994<!-- /gen --> balance with a serial print port. The orange part is the bridge: <!-- gen:spoken balance.kit -->Serial tap with nine-pin D-subminiature (DB9) pass-through<!-- /gen -->. It plugs into the existing <!-- gen:spoken balance.port.connector -->nine-pin D-subminiature (DB9) male<!-- /gen --> port. It does not change the balance, its firmware or its settings." |
| 5 | Open the **Overview** tab | "Read the Today column: <!-- gen:fact balance.today.count -->3<!-- /gen --> manual steps, and each one can go wrong. The analyst copies, types, and someone updates the ledger later." |
| 6 | Open the **Port** tab | "The tap reads the balance's own print output: <!-- gen:fact balance.port.settings -->2400 baud · 7E1 · no flow control<!-- /gen -->, on <!-- gen:fact balance.port.pins -->3<!-- /gen --> pins. It uses what the instrument already sends. No driver on a <!-- gen:term PC -->Personal Computer (PC)<!-- /gen --> is needed, so a <!-- gen:term LIMS -->Laboratory Information Management System (LIMS)<!-- /gen --> or Windows update cannot break it." |
| 7 | Press **Run bridge**. Stay on the **Data** tab | "Here is a real weigh-by-difference. The balance prints <!-- gen:fact balance.run.lines -->5<!-- /gen --> lines. The bridge stamps the time on every line as it arrives." |
| 8 | Point to the struck-out rows | "<!-- gen:fact balance.run.unstable -->3<!-- /gen --> of those readings are marked D: still moving, so the bridge drops them. <!-- gen:fact balance.run.stable -->2<!-- /gen --> are stable and count, the same rule an analyst follows." |
| 9 | Point to the result card | "The first stable weight, <!-- gen:fact balance.run.first -->25.4821<!-- /gen --> <!-- gen:fact balance.run.unit -->g<!-- /gen -->, less the last, <!-- gen:fact balance.run.last -->25.3617<!-- /gen --> <!-- gen:fact balance.run.unit -->g<!-- /gen -->, is <!-- gen:fact balance.run.used -->0.1204<!-- /gen --> <!-- gen:fact balance.run.unit -->g<!-- /gen --> used. The bridge does the arithmetic, so nobody types a number." |
| 10 | The app opens the **Deliver** tab | "That one reading becomes two records: a sample result in the <!-- gen:term LIMS -->Laboratory Information Management System (LIMS)<!-- /gen -->, and a use entry in the controlled-substance ledger." |
| 11 | Point to the ledger card | "Look at the ledger card: <!-- gen:fact balance.ledger.substance -->Codeine phosphate reference standard<!-- /gen -->, schedule <!-- gen:fact balance.ledger.schedule -->II<!-- /gen -->, goes from <!-- gen:fact balance.ledger.opening -->1.8735<!-- /gen --> <!-- gen:fact balance.ledger.unit -->g<!-- /gen --> to <!-- gen:fact balance.ledger.closing -->1.7531<!-- /gen --> <!-- gen:fact balance.ledger.unit -->g<!-- /gen -->. The ledger and the instrument now agree, and the analyst wrote nothing down." |
| 12 | Point to the receipts | "Each system sends back a receipt: <!-- gen:fact balance.receipt.lims -->RES-000001<!-- /gen --> for the <!-- gen:term LIMS -->Laboratory Information Management System (LIMS)<!-- /gen --> and <!-- gen:fact balance.receipt.ledger -->CSU-000001<!-- /gen --> for the ledger. If a required field is missing, the record is rejected and the screen names the field. It never fails silently." |
| 13 | Select the <!-- gen:spoken hplc.name -->High-Performance Liquid Chromatography (HPLC) system<!-- /gen --> card. Press **Run bridge** | "The <!-- gen:spoken hplc.name -->High-Performance Liquid Chromatography (HPLC) system<!-- /gen --> is a <!-- gen:fact hplc.era -->2004<!-- /gen --> system with a network port. It prints <!-- gen:fact hplc.run.lines -->6<!-- /gen --> lines. The bridge drops <!-- gen:fact hplc.run.unstable -->1<!-- /gen --> peak: the solvent front, which comes off before the sample. In this demo, purity is <!-- gen:fact hplc.run.used -->98.5<!-- /gen --><!-- gen:fact hplc.run.unit -->%<!-- /gen --> of the area. Only the <!-- gen:term LIMS -->Laboratory Information Management System (LIMS)<!-- /gen --> gets a record. No container is used up." |
| 14 | Select the <!-- gen:spoken gc-ms.name -->Gas Chromatography-Mass Spectrometry (GC-MS)<!-- /gen --> card. Press **Run bridge** | "The <!-- gen:spoken gc-ms.name -->Gas Chromatography-Mass Spectrometry (GC-MS)<!-- /gen --> is a <!-- gen:fact gc-ms.era -->1996<!-- /gen --> system with a <!-- gen:fact gc-ms.port.kind -->IEEE-488 (GPIB)<!-- /gen --> port. It prints <!-- gen:fact gc-ms.run.lines -->6<!-- /gen --> lines. The bridge drops <!-- gen:fact gc-ms.run.unstable -->1<!-- /gen --> peak: the air. The library scores each other peak, and the bridge keeps the best match: <!-- gen:fact gc-ms.run.analyte -->Oxycodone<!-- /gen -->, <!-- gen:fact gc-ms.run.used -->97<!-- /gen --> <!-- gen:fact gc-ms.run.unit -->% match<!-- /gen -->. Only the <!-- gen:term LIMS -->Laboratory Information Management System (LIMS)<!-- /gen --> gets a record." |
| 15 | Open the **Kit** tab | "This is what we install: <!-- gen:spoken gc-ms.kit -->IEEE-488 (GPIB) tap with 24-pin pass-through<!-- /gen -->. The tab lists each part, the install steps, the checks that must pass, and the safeguards. Nothing in it changes the instrument." |
| 16 | Select the <!-- gen:spoken lc-ms.name -->Liquid Chromatography-Tandem Mass Spectrometry (LC-MS/MS)<!-- /gen --> card. Press **Run bridge**, then open the **Kit** tab | "The <!-- gen:spoken lc-ms.name -->Liquid Chromatography-Tandem Mass Spectrometry (LC-MS/MS)<!-- /gen --> is a <!-- gen:fact lc-ms.era -->2011<!-- /gen --> system on the <!-- gen:fact lc-ms.port.kind -->LAN<!-- /gen -->. Its data system writes a results file to a network folder. The <!-- gen:fact lc-ms.kit -->LAN file pickup<!-- /gen --> kit reads each new file through a read-only share. It keeps each raw file with its hash and the time it read it. It never writes to the share and never sends a command to the instrument. The file has <!-- gen:fact lc-ms.run.lines -->5<!-- /gen --> lines. The bridge drops <!-- gen:fact lc-ms.run.unstable -->2<!-- /gen --> results: each is below the lower limit of quantitation or has an internal standard response out of range. It sends <!-- gen:fact lc-ms.run.records -->2<!-- /gen --> records, such as <!-- gen:fact lc-ms.run.analyte -->Fentanyl<!-- /gen --> at <!-- gen:fact lc-ms.run.used -->12.4<!-- /gen --> <!-- gen:fact lc-ms.run.unit -->ng/mL<!-- /gen -->." |
| 17 | Select the <!-- gen:spoken gc.name -->Gas Chromatography (GC) system<!-- /gen -->, the <!-- gen:fact ph-meter.name -->pH meter<!-- /gen --> and the <!-- gen:fact kf-titrator.name -->Karl Fischer titrator<!-- /gen --> in turn. Press **Run bridge** on each | "The same steps run on each one. The <!-- gen:term GC -->Gas Chromatography (GC)<!-- /gen --> prints <!-- gen:fact gc.run.lines -->6<!-- /gen --> lines and makes <!-- gen:fact gc.run.records -->3<!-- /gen --> records, one for each solvent. The pH meter keeps the last settled value: <!-- gen:fact ph-meter.run.used -->7.02<!-- /gen --> <!-- gen:fact ph-meter.run.unit -->pH<!-- /gen -->. The titrator keeps the <!-- gen:fact kf-titrator.run.analyte -->Water<!-- /gen --> result: <!-- gen:fact kf-titrator.run.used -->0.412<!-- /gen --><!-- gen:fact kf-titrator.run.unit -->%<!-- /gen -->." |
| 18 | Point back to the catalogue | "The same pattern works for each instrument: read its native output, parse it, apply the lab's rules, then deliver it to the systems the lab already uses. The <!-- gen:term LIMS -->Laboratory Information Management System (LIMS)<!-- /gen --> stays the system of record. The bridge is a small part that you can test on its own." |
| 19 | End on the full screen | "If your lab has an instrument that still makes paper, I want to hear which one. That is the next one I build." |

## Credibility Rules

- Say "designed to support validation". Never say "Part 11 compliant" or "validated".
- Say "the <!-- gen:term DEA -->Drug Enforcement Administration (DEA)<!-- /gen --> audits the <!-- gen:term CS -->controlled-substance (CS)<!-- /gen --> ledger". Do not say the <!-- gen:term DEA -->Drug Enforcement Administration (DEA)<!-- /gen --> receives this data.
- Say "prototype" or "demo" one time, near the start or the end.
- Say "in this demo" when you give a figure. The containers and weights are sample data.
- Say the ledger is a demo: it keeps no state, and every run starts from the same opening balance. A database comes later.
- The bridge does not replace the <!-- gen:term LIMS -->Laboratory Information Management System (LIMS)<!-- /gen -->, the <!-- gen:term CDS -->chromatography data system (CDS)<!-- /gen --> or the <!-- gen:term ERP -->Enterprise Resource Planning (ERP)<!-- /gen -->. It moves data into them.

## Likely Questions

| Question | Short answer |
|---|---|
| Is this Part 11 compliant? | Not yet. The design keeps the raw output, stamps the time on each line, and leaves the <!-- gen:term LIMS -->Laboratory Information Management System (LIMS)<!-- /gen --> as the system of record. Validation comes with each install: <!-- gen:term IQ -->installation qualification (IQ)<!-- /gen -->, <!-- gen:term OQ -->operational qualification (OQ)<!-- /gen --> and <!-- gen:term PQ -->performance qualification (PQ)<!-- /gen -->. |
| What if our <!-- gen:term LIMS -->Laboratory Information Management System (LIMS)<!-- /gen --> vendor updates? | The bridge talks to the <!-- gen:term LIMS -->Laboratory Information Management System (LIMS)<!-- /gen --> through its import interface. The instrument side does not change, so only that one mapping needs a retest. |
| Do you change the instrument? | No. The tap reads the port the instrument already has. |
| Which instruments work today? | <!-- gen:spoken catalog.liveNames -->Analytical balance, High-Performance Liquid Chromatography (HPLC) system, Gas Chromatography (GC) system, Gas Chromatography-Mass Spectrometry (GC-MS), pH meter, Karl Fischer titrator, and Liquid Chromatography-Tandem Mass Spectrometry (LC-MS/MS)<!-- /gen --> run in this demo. The other <!-- gen:fact catalog.planned -->6<!-- /gen --> are planned. Each live instrument has its own parser and its own rules, and uses the same pipeline. |
| Does it store the data? | Not in this demo. The ledger resets on every run. A database (SQLite or hosted) is the next step, behind one module. |
| What does a pilot look like? | One instrument, one lab, one data path from end to end, tested against your acceptance criteria. |

## Terms

<!-- gen:glossary -->
| Term | Meaning |
| ---- | ------- |
| Chromatography data system (CDS) | The software for High-Performance Liquid Chromatography (HPLC) and Gas Chromatography (GC) systems. It runs the instrument and stores its results |
| Code of Federal Regulations (CFR) | The set of United States federal rules. Title 21 covers food and drugs |
| Controlled-substance (CS) | Describes a drug that the Drug Enforcement Administration (DEA) regulates. A controlled-substance (CS) ledger is the running record of each container, as Title 21 of the Code of Federal Regulations (CFR), Part 1304, requires |
| Nine-pin D-subminiature (DB9) | A nine-pin serial connector, common on older instruments |
| Drug Enforcement Administration (DEA) | The United States agency that regulates controlled substances |
| Enterprise Resource Planning (ERP) | The business system for assets, orders and inventory |
| Food and Drug Administration (FDA) | The United States agency that regulates drugs and how they are tested |
| Gas Chromatography (GC) | A method that separates the parts of a vapor sample |
| Gas Chromatography-Mass Spectrometry (GC-MS) | Gas Chromatography (GC) that also identifies each part by its mass |
| High-Performance Liquid Chromatography (HPLC) | A method that separates the parts of a liquid sample |
| Installation qualification (IQ) | The check that a system is installed as specified |
| Liquid Chromatography-Tandem Mass Spectrometry (LC-MS/MS) | Liquid chromatography with two mass filters in a row. It measures trace amounts of a drug |
| Laboratory Information Management System (LIMS) | The system of record for samples and results |
| Operational qualification (OQ) | The check that a system works across its operating range |
| Personal Computer (PC) | A desktop or laptop computer |
| Performance qualification (PQ) | The check that a system performs as needed in real use |
<!-- /gen -->

**Weigh by difference:** weigh the container before and after you remove material. The difference is the amount used.
