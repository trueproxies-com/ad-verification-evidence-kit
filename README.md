# Ad verification evidence kit

Blank, versioned templates for recording ad verification checks so that results
from different markets, dates and people stay comparable and can be handed to an
ad network, an affiliate program or a client as evidence.

The kit is published and documented at
<https://trueproxies.com/use-cases/ad-verification/#ad-verification-evidence-kit>
(method `ad-verification-v1`, last reviewed 2026-07-18). This repository holds
the same files so you can fork them, open issues, or pin a version.

## What is in it

| File | What it is |
| --- | --- |
| `templates/ad-verification-observation-template-v1.json` | Blank batch plan, empty observations array and blank batch summary, in the documented field order |
| `templates/ad-verification-observation-template-v1.csv` | Header-only CSV with the same plan, observation and summary columns |
| `templates/ad-verification-field-dictionary-v1.json` | Field groups, definitions, sanitization rules, failure and success rules, challenge-rate rules |
| `examples/check.mjs` | A Playwright script that preflights the proxy exit, loads one URL, records the HTTP redirect chain and every navigation, and saves a screenshot and a HAR |

The templates contain no observations, credentials, raw exit IPs, account
identifiers or screenshots. Populate them only with authorized observations and
keep sensitive source evidence in an access-controlled system.

## How to use it

1. **Declare the batch first.** Fill the `batch_plan`: a non-sensitive batch ID
   and campaign reference, the expected market, schedule, sample size, the
   success rule (accepted HTTP status range, required final path, optional
   creative ID) and any known limitations.
2. **Preflight the exit.** Before loading the ad or landing page, confirm the
   proxy connects and record the exit's routed country. Store raw exit evidence
   outside the worksheet and keep only a non-reversible, access-controlled
   reference (`observed_exit_reference`).
3. **Run one check per observation.** `examples/check.mjs` shows the minimum:
   preflight, navigate, capture the redirect chain, final URL, status and a
   screenshot. Give every observation a unique ID and record `not_tested` for
   evidence skipped after a navigation failure.
4. **Map the output to the field dictionary.** One row per observation, in the
   documented order: exit reference and country, network origin, browser,
   viewport, locale, consent and account state, requested and final URL,
   redirect chain, HTTP status, creative and placement IDs, screenshot
   reference, challenge result, success and failure code.
5. **Summarize from the same rows.** Success rate over all observations,
   challenge rate only over challenge-tested observations, and the coverage of
   the challenge test published beside it.

### Running the example

```sh
npm i playwright
PROXY_SERVER=http://YOUR_HOST:8080 \
PROXY_USER=USER-country-de-city-berlin-session-ad01 \
PROXY_PASS=... \
node examples/check.mjs https://example.com/landing
```

Targeting is written on the proxy username. Country works on every
TrueProxies residential IPv4 plan; city, region and ASN need a GB-based plan.
The accepted options and values are listed in the
[connection reference](https://docs.trueproxies.com/proxy-instructions/how-to-connect/#options).

## Field groups

- **metadata**: `schema_version`, `method_version`, `last_reviewed`, `canonical_page`, `artifact_state`
- **batch_plan**: batch and campaign identifiers, expected market, schedule, declared sample size, route origin and selector, approved URL origin and paths, success rule, challenge indicator, settling and selector windows, limitation notes
- **observation**: observation and batch IDs, navigation timestamp (UTC), requested route country and selector notes, observed exit reference and country, network origin, browser and viewport, locale, consent and account state, requested and final URL, redirect chain, HTTP status, creative and placement IDs, screenshot reference, challenge result, success, failure code, limitation notes
- **batch_summary**: declared and observed sample size, successful and failed observations, success rate, challenge-tested and challenge-observed counts, challenge-test coverage, challenge rate, limitation notes

The full definitions, types and prohibited values are in the field dictionary.

## What a check can and cannot prove

A proxy adds a network vantage point. A check shows what one IP, location and
session received at one moment. It does not reproduce every consumer, device,
browser fingerprint, cookie state or auction condition, it does not measure
viewability, and a placement difference is evidence to repeat and investigate,
not automatic proof of fraud.

## Licence

MIT. See `LICENSE`.
