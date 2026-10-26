# Video Script: Bench Bridge Demo

Target length: 2.5–3 minutes. Audience: lab directors at DEA-registered, FDA-regulated test labs.

Demo figures come from `data/devices.json` and `data/ledger.json`. If those files change, update this script.

## Before You Record

- Open the tailnet link that `npm run dev` prints. Use a 1600 × 960 window or larger.
- Select the analytical balance. Set the drawing to **Exploded** with **Labels** on.
- Reload the page, so the pipeline strip shows no run.

## Script

| # | Screen action | What to say |
|---|---|---|
| 1 | Full screen, no clicks | "Most regulated labs have instruments that still work well but cannot talk to the LIMS. The data ends up on paper, then someone types it in." |
| 2 | Point to the catalogue on the left | "These are the older instruments a DEA-registered test lab usually runs. Balances, HPLC, GC-MS, dissolution, KF. Each one has an output port. The data is there, but it is in a format the LIMS cannot take." |
| 3 | Point to the balance card | "I start with the analytical balance, because every controlled-substance weigh-out has to match the CS ledger. That is the record the DEA audits." |
| 4 | Drag the spacing slider to Assembled, then back to Exploded | "This is a 1990s balance with a serial print port. The orange part is the bridge: a small tap that plugs into the existing DB9 port. It does not change the balance, its firmware or its settings." |
| 5 | Open the **Overview** tab | "Today the analyst copies two weights onto a paper log, types the result into the LIMS, and someone updates the CS ledger later. That is three transcriptions, and each one can go wrong." |
| 6 | Open the **Port** tab | "The tap reads the balance's own print output: 2400 baud, three pins. It uses what the instrument already sends. No driver on a PC is needed, so a LIMS or Windows update cannot break it." |
| 7 | Press **Run bridge**. Stay on the **Data** tab | "Here is a real weigh-by-difference. The balance prints each reading. The bridge stamps the time on every line as it arrives." |
| 8 | Point to the struck-out rows | "Readings marked D are still moving, so the bridge drops them. Only stable readings count, the same rule an analyst follows." |
| 9 | Point to the result card | "The first stable weight less the last is 0.1204 grams used. The bridge does the arithmetic, so nobody types a number." |
| 10 | The app opens the **Deliver** tab | "That one reading becomes two records: a sample result in the LIMS, and a use entry in the controlled-substance ledger." |
| 11 | Point to the ledger card | "The codeine reference standard goes from 1.8735 grams to 1.7531 grams. The ledger and the instrument now agree, and the analyst wrote nothing down." |
| 12 | Point to the receipts | "Each system sends back a receipt. If a required field is missing, the record is rejected and the screen names the field. It never fails silently." |
| 13 | Point back to the catalogue | "The same pattern works for each instrument: read its native output, parse it, apply the lab's rules, then deliver it to the systems the lab already uses. The LIMS stays the system of record. The bridge is a small part that you can test on its own." |
| 14 | End on the full screen | "If your lab has an instrument that still makes paper, I want to hear which one. That is the next one I build." |

## Credibility Rules

- Say "designed to support validation". Never say "Part 11 compliant" or "validated".
- Say "the DEA audits the CS ledger". Do not say the DEA receives this data.
- Say "prototype" or "demo" one time, near the start or the end.
- Say "in this demo" when you give a figure. The containers and weights are sample data.
- The bridge does not replace the LIMS, the CDS or the ERP. It moves data into them.

## Likely Questions

| Question | Short answer |
|---|---|
| Is this Part 11 compliant? | Not yet. The design keeps the raw output, stamps the time on each line, and leaves the LIMS as the system of record. Validation (IQ/OQ/PQ) comes with each install. |
| What if our LIMS vendor updates? | The bridge talks to the LIMS through its import interface. The instrument side does not change, so only that one mapping needs a retest. |
| Do you change the instrument? | No. The tap reads the port the instrument already has. |
| What about HPLC and GC-MS? | They are next in the catalogue. Their problem is old chromatography software, which loses driver support after updates. |
| What does a pilot look like? | One instrument, one lab, one data path from end to end, tested against your acceptance criteria. |

## Terms

| Term | Meaning |
|---|---|
| LIMS | Laboratory information management system: the system of record for samples and results |
| CS ledger | The running record of each controlled-substance container, as 21 CFR 1304 requires |
| CDS | Chromatography data system: the software that runs an HPLC or GC |
| Weigh by difference | Weigh the container before and after you remove material. The difference is the amount used. |
| IQ/OQ/PQ | Installation, operational and performance qualification: the steps that validate a system |
