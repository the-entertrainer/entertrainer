import type { Module } from './types'

export const M10: Module = {
  id: 'm10', n: '10', accent: 'var(--blue)',
  title: 'Risk, evidence and the frontier',
  intro: 'The last module of the day, and the one that decides whether the rest of it was useful. Four kinds of real, documented harm; the safety problem stated precisely rather than dramatically; and then the hardest part — how to think about what the frontier labs might have that you cannot see, without either inventing it or pretending the question is silly.',
  objectives: [
    'Explain why fabrication is a property of the mechanism rather than a fixable bug.',
    'Distinguish the four main documented harm categories and where each originates.',
    'State the alignment problem precisely, without recourse to science fiction.',
    'Classify any claim about frontier or unreleased AI into one of five evidence tiers.'
  ],
  lessons: [
    {
      id: 'm10l1', title: 'Fabrication', minutes: 9, completion: 'check',
      summary: 'Why models invent things, and why "just stop it" is not available.',
      blocks: [
        { type: 'text', lead: true, body: [
          'The industry calls it hallucination. The word is unhelpful — it suggests a malfunction, a perceptual glitch, something going wrong. Nothing is going wrong. The system is doing exactly what it was built to do.',
          'A language model produces likely continuations of text. A citation that does not exist is an extremely likely-looking continuation: it has the right author-style name, the right journal-style title, a plausible year, a well-formed page range. Every feature the model was optimised for is present. The only missing property — that the paper exists — is one the training objective never mentioned.',
          'This is why the problem is stubborn. It is not a bug sitting in the code waiting to be found. It is a direct consequence of optimising for plausibility on a system that has no separate representation of truth.'
        ] },
        { type: 'video', videoId: 'v-hallucinate' },
        { type: 'accordion', title: 'What actually helps, and how much', items: [
          { q: 'Retrieval (RAG)', a: 'Give the model the source material and instruct it to answer only from that. Substantially reduces invention on questions the documents cover. Does not eliminate it: models still misread passages and still add plausible detail that is in none of them. Helpful, not sufficient.' },
          { q: 'Tools', a: 'Let it call a calculator, a database, a search engine. Very effective for the specific class of problem the tool covers — arithmetic stops being guessed, dates stop being estimated. Does nothing for anything outside the tool.' },
          { q: 'Asking for citations', a: 'Weaker than it sounds, and often counterproductive. Without a retrieval system attached, a model can invent citations as readily as it invents facts, and the presence of a reference list makes the output feel more trustworthy while being no more reliable. Only useful if you actually follow the links.' },
          { q: 'Asking the model how confident it is', a: 'Unreliable. Expressed confidence is a trained conversational style; it correlates weakly at best with correctness. A model that says "I am certain" has produced a phrase, not a measurement.' },
          { q: 'Checking it yourself', a: 'The only thing that works completely, and the reason "use it where output is checkable" is the practical rule this course keeps returning to. This is not a counsel of despair — it is a description of a tool whose value lies in producing a draft faster than you could, not in being an oracle.' }
        ] },
        { type: 'evidence', confidence: 'high',
          claim: 'Fabricated content is an expected consequence of how language models are trained, not an incidental defect.',
          basis: 'This follows directly from the training objective, is stated in model documentation from every major lab, and is documented in evaluation literature. Labs disagree about how far it can be reduced; none claims it is solved.' },
        { type: 'check', questions: [
          { id: 'q1001', kind: 'mcq', difficulty: 'moderate', objective: 'Evaluate AI claims',
            stem: 'Why is fabrication difficult to eliminate?',
            options: [
              'The model optimises for plausible continuations and has no separate representation of truth',
              'Training data contains too many errors',
              'Models are not large enough yet',
              'It only happens with poorly written prompts'
            ], answer: [0],
            rationale: 'The objective is plausibility. A fabricated citation satisfies it perfectly. Nothing in the training signal distinguishes "true" from "well-formed", which is why the problem is structural rather than incidental.',
            distractors: {
              1: 'Data quality matters, but a perfectly accurate corpus would not fix it — the model still generalises to text it never saw.',
              2: 'Larger models reduce error rates on some tasks and still fabricate.',
              3: 'Prompting helps at the margins and does not remove the mechanism.'
            } },
          { id: 'q1002', kind: 'mcq', difficulty: 'moderate', objective: 'Evaluate AI claims',
            stem: 'Which is the most reliable safeguard when using a model for factual work?',
            options: [
              'Restricting use to outputs you can check, and checking them',
              'Asking the model to state its confidence',
              'Requesting citations without following them',
              'Using the largest available model'
            ], answer: [0],
            rationale: 'Every other option delegates verification to the system that produced the error. Checkability is the boundary of safe use, and it is a boundary you control rather than one the vendor controls.',
            distractors: {
              1: 'Expressed confidence is a style, not a measurement.',
              2: 'Unfollowed citations increase apparent credibility without increasing reliability — arguably the worst option on this list.',
              3: 'Reduces some error rates, changes nothing structurally.'
            } }
        ] }
      ]
    },
    {
      id: 'm10l2', title: 'Four kinds of harm', minutes: 10, completion: 'check',
      summary: 'Bias, privacy, copyright and labour — documented, present tense, unglamorous.',
      blocks: [
        { type: 'text', body: [
          'The harms most discussed in public are the speculative ones. The harms with the best evidence are ordinary, current, and mostly a matter of who bears a cost that somebody else decided to impose.'
        ] },
        { type: 'video', videoId: 'v-bias' },
        { type: 'tabs', items: [
          { label: 'Bias', body: 'A model fitted to historical decisions reproduces the patterns in them. This is not a flaw in the algorithm; it is the algorithm working. The five entry points are worth memorising: the problem framing, who is in the data, how it was labelled, what the model optimises, and how the output is used. Most public arguments about "biased AI" are arguing about different entry points without saying which — and the remedies for each are completely different, mostly organisational rather than technical.' },
          { label: 'Privacy', body: 'Two distinct issues, often conflated. First, training data: models are trained on scraped text that may include personal information, and under some conditions models can reproduce fragments of training data. Second, use: what you type into a hosted assistant goes to a third party. The second is the one you actually control, and the one worth having a policy about before someone pastes a customer list into a chat box.' },
          { label: 'Copyright', body: 'Whether training on copyrighted work without a licence is permitted is genuinely unsettled and being litigated in several jurisdictions simultaneously. Anyone who tells you the answer is clear — in either direction — is stating a position. What is not in dispute: generated output can closely resemble specific training material under some prompts, and "the model made it" is not currently a reliable defence for a publisher.' },
          { label: 'Labour', body: 'Displacement is real, uneven and hard to measure well. The pattern in evidence so far is task-level rather than job-level: parts of jobs become faster, roles shift, and the effects concentrate in specific occupations rather than spreading evenly. Treat both "it will replace everyone" and "nothing will change" as positions requiring evidence — and note that the people making each claim usually have an interest in it.' }
        ] },
        { type: 'evidence', confidence: 'high', sourceId: 's-nist',
          claim: 'Bias, privacy, security and accountability are treated as first-order, governable risks in published standards frameworks.',
          basis: 'NIST\'s AI Risk Management Framework and the OECD AI Principles both structure these as risks with named controls. This is a claim about what published frameworks say, which is directly checkable.' },
        { type: 'evidence', confidence: 'low',
          claim: 'AI will cause net large-scale unemployment within the next decade.',
          basis: 'Rated low. Forecasts vary by an order of magnitude, methodologies differ fundamentally, and previous automation forecasts have a poor track record in both directions. There is real measured task-level displacement; extrapolating it to aggregate employment is not supported by evidence currently available.' },
        { type: 'check', questions: [
          { id: 'q1003', kind: 'mrq', difficulty: 'hard', objective: 'Evaluate AI claims',
            stem: 'A hiring model trained on ten years of a company\'s interview decisions favours candidates resembling past hires. Which statements are accurate? Select all that apply.',
            options: [
              'The model is reproducing the pattern in its training labels',
              'The problem is in the data and framing, not only in the algorithm',
              'Removing the demographic field from the input reliably solves it',
              'This is a foreseeable outcome rather than a surprising one'
            ], answer: [0, 1, 3],
            rationale: 'Supervised models fit their labels. If the labels encode past preference, the model encodes past preference — and this is predictable from the mechanism, which is why it counts as a design failure rather than an accident.',
            distractors: { 2: 'Removing the field rarely works: other features correlate with it — postcode, school, hobbies, name — and the model finds them. This is well documented and is the standard trap.' } }
        ] },
        { type: 'resource', resourceIds: ['r-nist-rmf', 'r-eu-ai-act', 'r-oecd'] }
      ]
    },
    {
      id: 'm10l3', title: 'The alignment problem, stated plainly', minutes: 8, completion: 'read',
      summary: 'Not robots turning evil. Specification, and the difficulty of it.',
      blocks: [
        { type: 'text', body: [
          'Strip away the film references and the safety problem is this: it is very hard to specify what you want precisely enough that a competent optimiser cannot satisfy your specification while defeating your intention.',
          'This is not speculative and it is not new. It has a well-documented history in every field that has ever set a target. Pay a bounty per rat tail and people farm rats. Optimise a recommendation system for watch time and it learns that outrage is engaging. Reward a simulated robot for forward velocity and it grows tall and falls over, which is technically forward motion.',
          'None of these systems malfunctioned. Each did precisely what it was told, and the specification was wrong in a way nobody noticed until the optimiser found the gap. That is the whole problem, and it gets harder as systems get more capable, because a more capable optimiser finds more gaps.'
        ] },
        { type: 'video', videoId: 'v-ai-safety' },
        { type: 'accordion', title: 'Four distinct problems that get merged into one', items: [
          { q: 'Specification', a: 'Saying what you want. The rat-tail problem. Present in every deployed system today, entirely mundane, and the source of most real-world AI failures.' },
          { q: 'Robustness', a: 'Behaving sensibly on inputs unlike the training data — including inputs an adversary chose specifically to break it. Prompt injection, where instructions hidden in a document that a model reads get followed, is the live version of this for anyone deploying agents.' },
          { q: 'Interpretability', a: 'Knowing why a system produced an output. Real research progress exists and it is partial. This matters practically: if you cannot say why a model refused a loan, you may not be permitted to use it for loans.' },
          { q: 'Control at high capability', a: 'The question of whether sufficiently capable systems can be reliably overseen. This is the one that attracts the science-fiction framing, and it is also a serious research area that serious people work in. The honest position is that it is a real open question about which informed people disagree, and that it is not the source of any documented harm today.' }
        ] },
        { type: 'text', body: [
          'Why separate them? Because they have different evidence bases and different remedies, and merging them wrecks the conversation. Specification failures happen weekly and are fixed by better evaluation and narrower scope. Control at high capability is a research question with no current casualties. Someone who dismisses the fourth as fantasy usually ends up ignoring the first three, which are the ones costing money right now. Someone who talks only about the fourth ends up with no view on the system their organisation deployed last Tuesday.'
        ] },
        { type: 'quote',
          text: 'The failure mode is not a system that disobeys. It is a system that obeys exactly, and reveals that you asked for the wrong thing.',
          attribution: 'A summary of the specification problem as it is usually taught',
          source: 'Characterisation of the standard framing rather than a quotation from a named source.' }
      ]
    },
    {
      id: 'm10l4', title: 'The frontier, and the question you came here to ask', minutes: 13, completion: 'activity',
      summary: 'How to think about unreleased and rumoured capability without inventing any of it.',
      blocks: [
        { type: 'text', lead: true, body: [
          'People want to know what the labs have that has not been released, and whether governments have something else again. It is a reasonable question and it deserves a real answer rather than a deflection.',
          'Here is the honest position, stated once and clearly. **This course has no access to non-public information, and it will not pretend otherwise.** Nothing in this module is based on inside knowledge, and any course that claims otherwise is either mistaken or lying to you. What can be done — and what is genuinely useful — is to give you a method for sorting claims about the unseen into tiers, so you can hold each one at the weight it deserves.'
        ] },
        { type: 'labeled', caption: 'Five tiers. Every claim about frontier AI belongs in exactly one.',
          parts: [
            { label: '1 · Verified public evidence', body: 'Released models you can use, published papers, model cards, technical reports, independently reproduced benchmark results, regulatory filings. You can check these yourself. Example: the transformer architecture and its published performance characteristics.' },
            { label: '2 · Credible reporting and informed analysis', body: 'Established journalism with named sourcing; analysis by researchers with relevant expertise; disclosures in company filings. Not directly verifiable by you, but attributable and correctable. Example: reporting on the approximate scale of a training run, sourced to people involved.' },
            { label: '3 · Industry rumour and unverified claim', body: 'Anonymous accounts, unattributed leaks, "people are saying", demonstrations without independent testing, capability claims in fundraising material. Sometimes true. Sometimes a negotiating position. No means of telling from the outside, and this tier is where almost all excited discussion actually lives.' },
            { label: '4 · Speculation and scenario', body: 'Reasoned forecasts, thought experiments, extrapolations. Useful for planning and for stress-testing your assumptions. Not evidence about the present. Example: most published timelines for advanced capability.' },
            { label: '5 · Genuinely unknowable from outside', body: 'Classified government programmes, internal prototypes never described publicly, capabilities under non-disclosure. The correct thing to say about this tier is that there is no reliable public evidence — and to notice that "no evidence" means exactly that, neither confirmation nor refutation.' }
          ] },
        { type: 'text', body: [
          'A few things can be said with reasonable confidence, and they are more interesting than rumour.',
          '**Labs run models internally before release.** This is not a secret; it is stated openly and is the obvious consequence of testing and safety evaluation. The interesting question is not whether internal models exist but how large the gap between internal and released capability is — and that is tier 3 for anyone outside.',
          '**Governments have applied AI to national-security work.** Publicly acknowledged in procurement records, budget documents and official statements across multiple countries. What those systems do specifically is tier 5.',
          '**The compute required for frontier training concentrates capability in few hands.** This is well evidenced from published cost and hardware trends, and it is arguably the most consequential structural fact in the field — more so than any individual model release. It is also checkable, which is why it belongs in tier 1 while most of what gets discussed does not.'
        ] },
        { type: 'evidence', confidence: 'speculative',
          claim: 'A significantly more capable model exists privately than any that has been publicly released.',
          basis: 'Labelled speculative on purpose. Internal pre-release testing is publicly acknowledged, so *some* gap certainly exists; the size of it is not publicly established, and claims about it circulate without attributable sourcing. Note that this claim is unfalsifiable from outside — which is a reason to hold it loosely, not a reason to believe it.' },
        { type: 'evidence', confidence: 'low',
          claim: 'Frontier labs are pursuing systems that can act autonomously over long horizons with tool use.',
          basis: 'Labs state this as a research direction in public material, so the intent is tier 1. Rated low here because what has actually been achieved internally is not independently verifiable, and stated research direction is a poor predictor of delivered capability — as this whole course has demonstrated four separate times.' },
        { type: 'sort',
          prompt: 'Sort each statement into the tier it belongs in. This is the capstone skill of the entire course, and it is the reason the historical modules came first.',
          buckets: ['Verified public evidence', 'Credible reporting or analysis', 'Rumour, speculation or unknowable'],
          items: [
            { text: 'A published paper describes an architecture, and independent groups have reproduced its results.', bucket: 0, why: 'Tier 1. Published, reproduced, checkable by you. This is the strongest form of evidence available in the field.' },
            { text: 'A named researcher, quoted in an established publication, describes the scale of a training run they worked on.', bucket: 1, why: 'Tier 2. Attributable and correctable, not directly verifiable. Reasonable to act on with the caveat attached.' },
            { text: 'An anonymous post claims a lab has an unreleased model far beyond anything public.', bucket: 2, why: 'Tier 3. Unattributable and unfalsifiable. Its persuasive force comes entirely from being exciting.' },
            { text: 'A vendor demo video shows a robot completing a household task.', bucket: 2, why: 'Tier 3. A demo is a best case with no reported success rate. Treat as an existence claim about one attempt.' },
            { text: 'A government budget line funds an AI programme whose contents are classified.', bucket: 1, why: 'Tier 2 for the existence of the programme — budget documents are public record. Tier 5 for what it does.' },
            { text: 'A forecast puts human-level general capability at a specific year.', bucket: 2, why: 'Tier 4. A scenario. Useful for planning, not evidence about the present — and the base rate for such forecasts is poor in both directions.' }
          ] },
        { type: 'practice', title: 'The capstone, part one',
          steps: [
            'Take the three entries in your claim log from modules 1, 4 and 7.',
            'Assign each one a tier from the five above.',
            'For each, write one sentence: what evidence would move it up a tier, and what would move it down?',
            'Now pick the claim that matters most to your actual work.',
            'Write a short paragraph you would be willing to say out loud in a meeting: what is established, what is reported, what is unknown, and what you would do about it anyway.'
          ],
          output: 'A tiered claim log and one defensible paragraph. That paragraph is the deliverable of this course, and it goes into the final capstone.' },
        { type: 'chart', kind: 'bar',
          caption: 'Every evidence-labelled claim in this course today, by confidence tier',
          note: 'Counted from the course\'s own content, not asserted: twenty-three claims were labelled across ten modules, and the shape leans hard towards "high" — because most of this course is settled history, not live argument. The one "speculative" entry is in this module, about exactly the thing nobody outside a lab can verify. The tiering you just practised on frontier claims is the same discipline this course tried to hold itself to.',
          data: [
            { label: 'High', value: 12 },
            { label: 'Medium', value: 6 },
            { label: 'Low', value: 4 },
            { label: 'Speculative', value: 1 }
          ] },
        { type: 'takeaway', title: 'The one thing to keep',
          body: 'You will not out-predict this field, and neither will anyone selling you a prediction. What you can do — and what almost nobody around you is doing — is separate what is established from what is reported from what is asserted, say which is which out loud, and act accordingly. That is the whole discipline, and today was practice for it.' }
      ]
    }
  ],
  extension: {
    title: 'Read what the labs publish about themselves',
    body: 'Frontier labs publish safety research, model specifications and interpretability work. Read them as primary sources with an interest: genuinely informative about intent and method, not neutral about conclusions. Pair them with NIST and the AI Index, which have no product to sell.',
    resourceIds: ['r-transformer-circuits', 'r-model-spec', 'r-anthropic-research', 'r-ai-index']
  }
}
