import type { Module } from './types'

export const M10: Module = {
  id: 'm10', n: '10', accent: 'var(--blue)',
  title: 'Risk, evidence and the frontier',
  intro: 'This is the last module of the day. It decides whether everything you learned before this was useful. You will learn four kinds of real, documented harm. You will learn the safety problem stated clearly, not dramatically. Then comes the hardest part: how to think about what AI labs might have that you cannot see, without inventing answers or pretending the question does not matter.',
  objectives: [
    'Explain why fabrication (AI making things up) is built into how the system works, not a bug you can simply fix.',
    'Name the four main documented kinds of harm from AI, and explain where each one comes from.',
    'Explain the alignment problem clearly, without relying on science fiction.',
    'Sort any claim about frontier or unreleased AI into one of five evidence tiers.'
  ],
  lessons: [
    {
      id: 'm10l1', title: 'When a model makes things up', minutes: 9, completion: 'check',
      summary: 'Why models invent facts, and why you cannot simply tell them to stop.',
      blocks: [
        { type: 'text', lead: true, body: [
          'The industry calls this "hallucination". That word is not very helpful. It makes it sound like something is broken, like a glitch in perception. But nothing is broken here. The system is doing exactly what it was built to do.',
          'A language model produces the text that is most likely to come next. A fake citation can look extremely likely: it has an author name that sounds right, a journal title that sounds right, a believable year, and a properly formatted page range. Every feature the model was trained to produce is there. The only thing missing is that the paper does not actually exist — and that is not something the training process ever asked the model to check.',
          'This is why the problem does not go away easily. It is not a bug hiding in the code, waiting to be found and fixed. It is a direct result of training a system to sound plausible, on a system that has no separate way of checking what is true.'
        ] },
        { type: 'video', videoId: 'v-hallucinate' },
        { type: 'accordion', title: 'What actually helps, and how much it helps', items: [
          { q: 'Retrieval (RAG)', a: 'Give the model the source documents, and tell it to answer only using them. This greatly reduces made-up answers for questions the documents cover. But it does not remove the problem completely: models can still misread a passage, or add believable details that are in none of the documents. This helps, but it is not enough on its own.' },
          { q: 'Tools', a: 'Let the model use a calculator, a database, or a search engine. This works very well for the exact kind of problem the tool handles — for example, arithmetic gets calculated instead of guessed, and dates get looked up instead of estimated. It does nothing for problems outside what the tool covers.' },
          { q: 'Asking for citations', a: 'This sounds helpful, but it is weaker than it seems, and can even make things worse. Without a retrieval system attached, a model can invent a citation just as easily as it invents any other fact, and a list of references makes an answer feel more trustworthy without making it any more reliable. This is only useful if you actually click the links and check them.' },
          { q: 'Asking the model how confident it is', a: 'This is unreliable. When a model states how confident it is, that is a trained style of talking, not a real measurement. It matches how correct the answer actually is only weakly, if at all. A model that says "I am certain" has produced a sentence, not a fact-check.' },
          { q: 'Checking it yourself', a: 'This is the only method that fully works, and it is why this course keeps repeating the same practical rule: use the model where you can check its output. This is not a reason to give up on the technology. It is simply a description of what the tool is good for — producing a first draft faster than you could write one yourself — and what it is not, which is a source of guaranteed truth.' }
        ] },
        { type: 'evidence', confidence: 'high',
          claim: 'Made-up content is an expected result of how language models are trained, not a random defect.',
          basis: 'This follows directly from what the training process is designed to do. It is stated in the official documentation from every major AI lab, and it is documented in research papers that test these models. Labs disagree about how much this problem can be reduced, but none of them claims it is solved.' },
        { type: 'check', questions: [
          { id: 'q1001', kind: 'mcq', difficulty: 'moderate', objective: 'Evaluate AI claims',
            stem: 'Why is it hard to stop AI models from making things up?',
            options: [
              'The model is trained to sound plausible, and has no separate way of checking what is true',
              'The training data contains too many mistakes',
              'Models are not big enough yet',
              'It only happens when the prompt is badly written'
            ], answer: [0],
            rationale: 'The model is trained to sound plausible. A fake citation meets that goal perfectly. Nothing in the training process tells "true" apart from "well formed" — which is why this problem is built into how the system works, not a random accident.',
            distractors: {
              1: 'Data quality matters, but even a perfectly accurate set of training text would not fix this — the model still has to generate new text it never saw before.',
              2: 'Bigger models do lower error rates on some tasks, and they still make things up.',
              3: 'A better prompt helps a little at the margins, and does not remove the underlying cause.'
            } },
          { id: 'q1002', kind: 'mcq', difficulty: 'moderate', objective: 'Evaluate AI claims',
            stem: 'What is the most reliable safeguard when you use a model for factual work?',
            options: [
              'Only using it for outputs you can check, and then checking them',
              'Asking the model how confident it is',
              'Asking for citations, without following the links',
              'Using the biggest model available'
            ], answer: [0],
            rationale: 'Every other option hands the job of checking the answer back to the same system that made the mistake in the first place. Whether you can check the output is the real boundary of safe use — and that boundary is something you control, not something the vendor controls.',
            distractors: {
              1: 'Stated confidence is just a way of talking, not a real measurement.',
              2: 'Citations you do not check make the answer look more trustworthy without making it any more reliable — arguably the worst option on this list.',
              3: 'This lowers some error rates, and it does not change the underlying cause at all.'
            } }
        ] }
      ]
    },
    {
      id: 'm10l2', title: 'Four kinds of harm', minutes: 10, completion: 'check',
      summary: 'Bias, privacy, copyright and jobs — real problems happening now, not dramatic ones.',
      blocks: [
        { type: 'text', body: [
          'The harms people talk about most in public are the speculative ones — the ones that have not been proven. The harms with the strongest evidence are ordinary and happening right now. Mostly, they come down to this: who pays the cost that someone else decided to create?'
        ] },
        { type: 'video', videoId: 'v-bias' },
        { type: 'tabs', items: [
          { label: 'Bias', body: 'A model trained on past decisions repeats the patterns in those decisions. This is not the algorithm failing — it is the algorithm doing its job correctly. There are five points where bias can enter, and they are worth remembering: how the problem is framed, who is included in the data, how the data was labelled, what the model is trained to optimise for, and how people use the output. Most public arguments about "biased AI" are really about different points on this list, without anyone saying which one they mean — and the fix is different for each point, mostly organisational rather than technical.' },
          { label: 'Privacy', body: 'There are two separate issues here, and people often mix them up. First, training data: models are trained on text collected from the internet, which may include personal information, and in some cases a model can reproduce small pieces of its training data. Second, use: whatever you type into a hosted AI assistant goes to another company. The second issue is the one you can actually control, and it is worth having a clear rule about it before someone pastes a customer list into a chat box.' },
          { label: 'Copyright', body: 'Whether it is legal to train an AI model on copyrighted work without a licence is genuinely unsettled, and courts in several countries are deciding it right now. Anyone who tells you the answer is obvious, in either direction, is just giving you an opinion. What is not in doubt: with the right prompt, generated output can closely resemble specific pieces of training material, and "the model made it" is not currently a safe legal defence for whoever publishes it.' },
          { label: 'Labour', body: 'Job displacement is real, but it is uneven and hard to measure accurately. So far, the evidence shows change at the level of tasks, not whole jobs: parts of a job become faster, roles shift, and the effects are concentrated in certain occupations rather than spread evenly across all of them. Be careful of both extreme claims — "it will replace everyone" and "nothing will change" — and ask for evidence either way. Notice, too, that the people making each claim usually have an interest in you believing it.' }
        ] },
        { type: 'evidence', confidence: 'high', sourceId: 's-nist',
          claim: 'Bias, privacy, security and accountability are treated as major, manageable risks in published standards frameworks.',
          basis: 'The US NIST AI Risk Management Framework and the OECD AI Principles both list these as risks, with named ways to manage them. This is a claim about what published frameworks actually say, so you can check it yourself directly.' },
        { type: 'evidence', confidence: 'low',
          claim: 'AI will cause large-scale unemployment overall within the next ten years.',
          basis: 'Rated low confidence. Different forecasts disagree by ten times or more, and they use very different methods, and past predictions about automation and jobs have often been wrong, in both directions. There is real, measured displacement at the level of individual tasks. Stretching that into a prediction about total employment is not supported by the evidence currently available.' },
        { type: 'check', questions: [
          { id: 'q1003', kind: 'mrq', difficulty: 'hard', objective: 'Evaluate AI claims',
            stem: 'A hiring model is trained on ten years of a company\'s interview decisions. It ends up favouring candidates who resemble people hired in the past. Which statements are accurate? Select all that apply.',
            options: [
              'The model is repeating the pattern found in its training data',
              'The problem lies in the data and how the task was framed, not only in the algorithm',
              'Removing the demographic field from the input reliably fixes the problem',
              'This is a foreseeable outcome, not a surprising one'
            ], answer: [0, 1, 3],
            rationale: 'Supervised models learn to match their training labels. If the labels contain a past preference, the model learns that same preference — and this is predictable from how the system works, which is why it counts as a design failure rather than an accident.',
            distractors: { 2: 'Removing the field rarely works: other pieces of information are linked to it — such as postcode, school, hobbies or name — and the model can use those instead. This is well documented, and it is a well-known trap.' } }
        ] },
        { type: 'resource', resourceIds: ['r-nist-rmf', 'r-eu-ai-act', 'r-oecd'] }
      ]
    },
    {
      id: 'm10l3', title: 'The alignment problem, explained simply', minutes: 8, completion: 'read',
      summary: 'Not robots turning evil. Stating what you want clearly, and how hard that is.',
      blocks: [
        { type: 'text', body: [
          'Take away the movie references, and the real safety problem is this: it is very hard to describe exactly what you want. You have to describe it so precisely that a skilled optimising system cannot follow your exact instructions while still doing the opposite of what you meant.',
          'This is not a guess about the future, and it is not new. It has a long, well-documented history in every field that has ever set a target for people or machines to hit. Pay people money for every rat tail they bring in, and people start farming rats instead of killing wild ones. Train a recommendation system to maximise watch time, and it learns that making people angry keeps them watching. Reward a simulated robot for moving forward fast, and it learns to grow tall and fall over, which is technically forward motion.',
          'None of these systems were broken. Each one did exactly what it was told. The instructions were wrong in a way nobody noticed until the system found the gap in them. That is the whole problem, and it gets harder as systems become more capable, because a more capable system is better at finding gaps.'
        ] },
        { type: 'video', videoId: 'v-ai-safety' },
        { type: 'accordion', title: 'Four separate problems that people often lump into one', items: [
          { q: 'Specification', a: 'Saying exactly what you want. This is the rat-tail problem. It exists in every AI system in use today, it is completely ordinary, and it causes most real-world AI failures.' },
          { q: 'Robustness', a: 'Behaving sensibly on inputs that are not like the training data — including inputs that someone deliberately chose to try to break the system. Prompt injection is a live example of this: it happens when a model reads a document with hidden instructions in it, and follows those instructions instead of the user\'s. Anyone building AI agents needs to watch for this.' },
          { q: 'Interpretability', a: 'Knowing why a system produced a particular output. Real research progress has been made here, but it is only partial. This matters in practice: if you cannot explain why a model refused someone a loan, you may not be legally allowed to use it for loan decisions.' },
          { q: 'Control at high capability', a: 'The question of whether a very capable AI system can be reliably supervised and kept in check. This is the topic that attracts science-fiction comparisons, but it is also a serious area of research that serious researchers work on. The honest answer is that this is a genuine open question, and informed people disagree about it. It is not the source of any documented harm today.' }
        ] },
        { type: 'text', body: [
          'Why keep these four separate? Because they have different evidence behind them and different fixes, and mixing them together ruins the conversation. Specification failures happen every week, and are fixed with better testing and a narrower scope for the system. Control at high capability is a research question with no documented harm so far. Someone who dismisses the fourth problem as science fiction usually ends up ignoring the first three — and those first three are the ones costing money right now. Someone who talks only about the fourth problem ends up with no opinion on the system their own organisation deployed last week.'
        ] },
        { type: 'quote', text: 'The failure mode is not a system that disobeys. It is a system that obeys exactly, and reveals that you asked for the wrong thing.',
          attribution: 'A summary of the specification problem as it is usually taught',
          source: 'This describes the usual way the idea is explained. It is not a word-for-word quote from a named person.' }
      ]
    },
    {
      id: 'm10l4', title: 'The frontier, and the question you really came here to ask', minutes: 13, completion: 'activity',
      summary: 'How to think about unreleased and rumoured AI capabilities, without making anything up.',
      blocks: [
        { type: 'text', lead: true, body: [
          'People want to know what AI labs have built that has not been released yet, and whether governments have something different again. This is a fair question, and it deserves a real answer, not a dodge.',
          'Here is the honest position, stated once, clearly. **This course has no access to private information, and it will not pretend that it does.** Nothing in this module comes from inside knowledge, and any course that claims otherwise is either mistaken or lying to you. What this course can do — and what is genuinely useful — is give you a method for sorting claims about the unseen into tiers, so that you give each claim exactly as much weight as it deserves.'
        ] },
        { type: 'labeled', caption: 'Five tiers. Every claim about frontier AI fits into exactly one of them.',
          parts: [
            { label: '1 · Verified public evidence', body: 'Released models you can use yourself, published research papers, model cards, technical reports, benchmark results that other people have independently reproduced, and official filings to regulators. You can check all of these yourself. Example: the transformer architecture, and its published performance results.' },
            { label: '2 · Credible reporting and informed analysis', body: 'Reporting from established news outlets that name their sources; analysis written by researchers with real expertise in the area; information disclosed in official company filings. You cannot check these yourself directly, but you can trace them back to a named source, and they can be corrected if wrong. Example: a news report on the approximate size of a training run, sourced to people who worked on it.' },
            { label: '3 · Industry rumour and unverified claim', body: 'Anonymous posts, leaks with no named source, "people are saying", demonstrations that nobody independent has tested, and capability claims made in fundraising material. Sometimes these are true. Sometimes they are a negotiating tactic. From the outside, there is no way to tell which. This is the tier where almost all of the exciting online discussion actually lives.' },
            { label: '4 · Speculation and scenario', body: 'Reasoned forecasts, thought experiments, and extrapolations from current trends. These are useful for planning ahead and for testing your own assumptions. They are not evidence about what exists right now. Example: most published timelines predicting when advanced AI capability will arrive.' },
            { label: '5 · Genuinely unknowable from outside', body: 'Classified government programmes, internal prototypes that have never been described publicly, and capabilities kept under non-disclosure agreements. The correct thing to say about this tier is that there is no reliable public evidence — and to notice that "no evidence" means exactly that. It neither confirms nor denies anything.' }
          ] },
        { type: 'text', body: [
          'A few things can be said with reasonable confidence, and they are more interesting than any rumour.',
          '**AI labs run models internally before they release them.** This is not a secret. It is stated openly, and it is the obvious result of testing and safety checks. The interesting question is not whether internal models exist — they do — but how big the gap is between what is used internally and what gets released. For anyone outside the lab, that question sits at tier 3.',
          '**Governments have used AI for national security work.** This is publicly acknowledged in procurement records, budget documents, and official statements from several countries. Exactly what those systems do is tier 5.',
          '**The huge amount of computing power needed to train frontier models means this capability sits in very few hands.** This is well supported by published costs and hardware trends, and it may be the single most important structural fact in the whole field — more important than any one model release. It is also something you can check, which is why it belongs at tier 1, while most of what people discuss does not.'
        ] },
        { type: 'evidence', confidence: 'speculative',
          claim: 'A private model exists that is significantly more capable than anything publicly released so far.',
          basis: 'Labelled speculative on purpose. It is publicly known that labs test models internally before release, so *some* gap certainly exists; how big that gap is has not been publicly established, and claims about it circulate without any named source. Note that this claim cannot be proven false from the outside — which is a reason to hold it loosely, not a reason to believe it.' },
        { type: 'evidence', confidence: 'low',
          claim: 'Frontier AI labs are working towards systems that can act on their own, over long stretches of time, using tools.',
          basis: 'Labs state this as a research goal in their public material, so the intent itself is tier 1. It is rated low confidence here because what has actually been achieved internally cannot be independently checked, and a stated research goal is a poor predictor of what actually gets delivered — as this course has shown four separate times already.' },
        { type: 'sort',
          prompt: 'Sort each statement into the tier it belongs in. This is the key skill of the whole course, and it is the reason the history modules came before this one.',
          buckets: ['Verified public evidence', 'Credible reporting or analysis', 'Rumour, speculation or unknowable'],
          items: [
            { text: 'A published paper describes an architecture, and independent research groups have reproduced its results.', bucket: 0, why: 'Tier 1. Published, reproduced, and checkable by you. This is the strongest form of evidence available in this field.' },
            { text: 'A named researcher, quoted in an established publication, describes the size of a training run they worked on.', bucket: 1, why: 'Tier 2. It can be traced to a named source and corrected if wrong, but you cannot verify it directly. Reasonable to act on, as long as you remember that caveat.' },
            { text: 'An anonymous post claims a lab has an unreleased model that is far beyond anything public.', bucket: 2, why: 'Tier 3. It cannot be traced to a source, and it cannot be proven false. Its persuasive power comes entirely from being exciting to read.' },
            { text: 'A vendor demo video shows a robot completing a task around the house.', bucket: 2, why: 'Tier 3. A demo shows the best possible case, with no reported success rate. Treat it only as proof that one attempt worked, nothing more.' },
            { text: 'A government budget line funds an AI programme, but the details of the programme are classified.', bucket: 1, why: 'Tier 2 for the fact that the programme exists — budget documents are public record. Tier 5 for what the programme actually does.' },
            { text: 'A forecast predicts that AI will reach human-level general ability in a specific year.', bucket: 2, why: 'Tier 4. This is a scenario. It is useful for planning, but it is not evidence about the present — and forecasts like this have historically been wrong in both directions.' }
          ] },
        { type: 'practice', title: 'The capstone, part one',
          steps: [
            'Take the three entries you wrote in your claim log in modules 1, 4 and 7.',
            'Give each one a tier from the five above.',
            'For each entry, write one sentence: what evidence would move it up a tier, and what would move it down?',
            'Now pick the claim that matters most for your own work.',
            'Write a short paragraph you would be willing to say out loud in a meeting: what is established, what is reported, what is unknown, and what you would do about it anyway.'
          ],
          output: 'A claim log with tiers assigned, and one paragraph you can defend. That paragraph is the final deliverable of this course, and it goes into your capstone.' },
        { type: 'chart', kind: 'bar',
          caption: 'Every claim in this course that was given a confidence label, grouped by tier',
          note: 'These numbers were counted directly from the course content, not just claimed: twenty-three claims were labelled across the ten modules, and most of them land on "high" confidence — because most of this course covers settled history, not live argument. The one "speculative" entry is in this module, about exactly the thing nobody outside a lab can verify. The same discipline you just practised sorting frontier claims into tiers is what this course tried to hold itself to as well.',
          data: [
            { label: 'High', value: 12 },
            { label: 'Medium', value: 6 },
            { label: 'Low', value: 4 },
            { label: 'Speculative', value: 1 }
          ] },
        { type: 'takeaway', title: 'The one thing to keep',
          body: 'You will not be able to predict this field better than anyone else, and neither can anyone trying to sell you a prediction. What you can do — and what almost nobody around you is doing — is separate what is established, from what is reported, from what is only claimed, say out loud which one is which, and act accordingly. That is the whole discipline, and today was your practice for it.' }
      ]
    }
  ],
  extension: {
    title: 'Read what the labs publish about themselves',
    body: 'Frontier labs publish safety research, model specifications and interpretability work. Read these as primary sources that have their own interests: genuinely informative about intent and method, but not neutral about their conclusions. Pair them with NIST and the AI Index, which have no product to sell.',
    resourceIds: ['r-transformer-circuits', 'r-model-spec', 'r-anthropic-research', 'r-ai-index']
  }
}
