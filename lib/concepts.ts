import type { Concept } from "@/lib/types";

const concepts = [
  // Exam 1 concepts
  {
    id: "scientific-method",
    week: 1,
    chapter: 1,
    exam: 1,
    topic: "The Scientific Method",
    summary:
      "Reliance on empirical inquiry using systematic, unbiased techniques to confirm or disprove prior conceptions. Produces probabilistic truth with defined limits and boundaries.",
  },
  {
    id: "pierces-4-paths",
    week: 1,
    chapter: 1,
    exam: 1,
    topic: "Pierce's 4 Paths to Knowledge",
    summary:
      "Four ways people arrive at belief: tenacity (stubborn habit), authority (trusting experts), a priori (pure logic, prone to bias), and the scientific method (empirical inquiry, the most reliable).",
  },
  {
    id: "basic-vs-applied",
    week: 1,
    chapter: 1,
    exam: 1,
    topic: "Basic vs. Applied Research",
    summary:
      "Basic research expands knowledge and tests theory for its own sake. Applied research answers specific practical questions or solves real-world problems.",
  },
  {
    id: "inductive-deductive",
    week: 1,
    chapter: 1,
    exam: 1,
    topic: "Inductive vs. Deductive Research",
    summary:
      "Inductive research starts with data and looks for patterns to generate new theories. Deductive research starts with a hypothesis and collects data to test it.",
  },
  {
    id: "qualitative-quantitative",
    week: 1,
    chapter: 1,
    exam: 1,
    topic: "Qualitative vs. Quantitative Research",
    summary:
      "Qualitative research uses open-ended questions and in-depth interviews to explore ideas. Quantitative research uses statistical analysis of numerical data to generalize findings across groups.",
  },
  {
    id: "lab-vs-field",
    week: 1,
    chapter: 1,
    exam: 1,
    topic: "Lab vs. Field Research",
    summary:
      "Lab research ensures control and internal validity. Field research provides real-world relevance and external validity. The choice involves a tradeoff between control and realism.",
  },
  {
    id: "concept",
    week: 1,
    chapter: 1,
    exam: 1,
    topic: "Concept",
    summary:
      "A generalized idea about a class of objects, attributes, occurrences, or processes. Examples in advertising include brand equity, brand loyalty, and advertising efficacy.",
  },
  {
    id: "conceptual-definition",
    week: 1,
    chapter: 1,
    exam: 1,
    topic: "Conceptual Definition",
    summary:
      "A verbal explanation of what a concept means — what it is and what it is not. For example, an attitude is a psychological tendency to evaluate something with some degree of favor or disfavor.",
  },
  {
    id: "operational-definition",
    week: 1,
    chapter: 1,
    exam: 1,
    topic: "Operational Definition",
    summary:
      "Defines a concept by specifying exactly how it will be measured, removing it from individual interpretation so anyone can test it the same way.",
  },
  {
    id: "operationism",
    week: 1,
    chapter: 1,
    exam: 1,
    topic: "Operationism",
    summary:
      "The principle that concepts in scientific theories must be grounded in observable, measurable events so they can be tested by anyone who follows the same procedures.",
  },
  {
    id: "measurement",
    week: 1,
    chapter: 1,
    exam: 1,
    topic: "Measurement",
    summary:
      "The process of linking abstract, unobservable concepts to observable events by assigning numbers to objects in a way that represents quantities of their attributes.",
  },
  {
    id: "frequency-distribution",
    week: 2,
    chapter: 2,
    exam: 1,
    topic: "Frequency Distribution",
    summary:
      "A summary of how often each value appears in a dataset. Displayed visually as a histogram with scores on the x-axis and frequency on the y-axis.",
  },
  {
    id: "central-tendency",
    week: 2,
    chapter: 2,
    exam: 1,
    topic: "Measures of Central Tendency",
    summary:
      "Three ways to describe the center of a distribution: mean (average), median (middle value), and mode (most frequent value).",
  },
  {
    id: "variance",
    week: 2,
    chapter: 2,
    exam: 1,
    topic: "Variance",
    summary:
      "A measure of how spread out scores are around the mean, calculated as the average of squared deviations from the mean. Sample variance formula: S² = Σ(Xi - X̄)² / (n-1).",
  },
  {
    id: "standard-deviation",
    week: 2,
    chapter: 2,
    exam: 1,
    topic: "Standard Deviation",
    summary:
      "The square root of variance. It tells you how much scores in a distribution typically deviate from the mean, expressed in the original units of measurement.",
  },
  {
    id: "normal-distribution",
    week: 2,
    chapter: 2,
    exam: 1,
    topic: "Normal Distribution",
    summary:
      "A symmetrical bell-shaped curve where almost all values fall within 3 standard deviations of the mean. The mean, median, and mode are all at the center.",
  },
  {
    id: "skew",
    week: 2,
    chapter: 2,
    exam: 1,
    topic: "Skewed Distributions",
    summary:
      "Positively skewed distributions tail off to the right. Negatively skewed distributions tail off to the left. Skew pulls the mean away from the median and mode.",
  },
  {
    id: "z-score",
    week: 2,
    chapter: 2,
    exam: 1,
    topic: "Z-Score",
    summary:
      "Tells you how far an individual score is from the mean in standard deviation units. Formula: z = (X - M) / SD. Makes scores from different scales directly comparable.",
  },
  {
    id: "standardized-normal",
    week: 2,
    chapter: 2,
    exam: 1,
    topic: "Standardized Normal Distribution",
    summary:
      "A normal distribution with a mean of 0 and standard deviation of 1. The area under the curve equals 1.0 and represents the probability of a score falling in any given region.",
  },
  {
    id: "ethics-deontology",
    week: 3,
    chapter: 3,
    exam: 1,
    topic: "Deontology",
    summary:
      "An ethical framework where certain actions are inherently right or wrong regardless of consequences. Based on two principles: the rights principle (universality and reversibility) and the justice principle.",
  },
  {
    id: "ethics-utilitarianism",
    week: 3,
    chapter: 3,
    exam: 1,
    topic: "Utilitarianism",
    summary:
      "An ethical framework focused on consequences — the correct action is whichever produces the greatest good for the greatest number of people.",
  },
  {
    id: "ethics-codes",
    week: 3,
    chapter: 3,
    exam: 1,
    topic: "Codes of Ethics in Research",
    summary:
      "Formal guidelines that make ethical expectations explicit. Three core concerns are respect for persons (informed consent), beneficence (do no harm), and justice (fair distribution of burdens and benefits).",
  },
  {
    id: "ethics-principles",
    week: 3,
    chapter: 3,
    exam: 1,
    topic: "Ethical Principles in Research",
    summary:
      "Key requirements for ethical research include voluntary participation, no harm to participants, anonymity and confidentiality, informed consent, and minimizing deception.",
  },
  {
    id: "moral-foundations",
    week: 3,
    chapter: 3,
    exam: 1,
    topic: "Five Moral Foundations",
    summary:
      "Harm, fairness, ingroup, authority, and purity. Liberals tend to prioritize harm and fairness, while conservatives tend to prioritize ingroup loyalty, authority, and purity.",
  },
  {
    id: "research-question",
    week: 4,
    chapter: 3,
    exam: 1,
    topic: "Research Questions vs. Hypotheses",
    summary:
      "A research question asks whether a relationship exists. A hypothesis makes a specific directional prediction that can be tested. Both must be answered using the scientific method.",
  },
  {
    id: "nominal",
    week: 4,
    chapter: 3,
    exam: 1,
    topic: "Nominal Level of Measurement",
    summary:
      "Numbers or labels used purely for classification with no meaningful order. Categories like gender, political party, or brand name are nominal.",
  },
  {
    id: "ordinal",
    week: 4,
    chapter: 3,
    exam: 1,
    topic: "Ordinal Level of Measurement",
    summary:
      "Categories arranged in a meaningful order, but the intervals between them are not equal. Rankings like bronze/silver/gold are ordinal — you know the order but not the exact distance between them.",
  },
  {
    id: "interval",
    week: 4,
    chapter: 3,
    exam: 1,
    topic: "Interval Level of Measurement",
    summary:
      "Values arranged in order with equal intervals between them, but no true zero point. SAT scores and Fahrenheit temperature are interval — you can measure differences but not true ratios.",
  },
  {
    id: "ratio",
    week: 4,
    chapter: 3,
    exam: 1,
    topic: "Ratio Level of Measurement",
    summary:
      "The highest level of measurement — ordered with equal intervals and a true zero point that means complete absence of the attribute. Age, dollars spent, and number of purchases are ratio.",
  },
  {
    id: "levels-of-measurement",
    week: 4,
    chapter: 3,
    exam: 1,
    topic: "Choosing a Level of Measurement",
    summary:
      "Higher levels of measurement contain all the properties of lower levels. The general rule is to always collect data at the highest level of measurement possible, since you can always simplify later but not upgrade.",
  },

  // Exam 2 concepts (original site)
  {
    id: "pearson-r",
    exam: 2,
    week: 1,
    chapter: 4,
    topic: "Pearson r Correlation",
    summary:
      "Numeric measure of linear association between two continuous variables. Range: -1 to +1. Does not imply causation.",
  },
  {
    id: "spearman",
    exam: 2,
    week: 1,
    chapter: 4,
    topic: "Spearman's Rank-Order Coefficient",
    summary: "Measures association between two ordinal/ranked variables. Range: -1 to +1.",
  },
  {
    id: "phi",
    exam: 2,
    week: 1,
    chapter: 4,
    topic: "Phi Coefficient",
    summary:
      "Measures linear relationship between two dichotomous (binary) variables. Range: -1 to +1.",
  },
  {
    id: "point-biserial",
    exam: 2,
    week: 1,
    chapter: 4,
    topic: "Point-Biserial Correlation",
    summary:
      "Special case of Pearson r for one dichotomous and one continuous variable.",
  },
  {
    id: "causal-relationships",
    exam: 2,
    week: 1,
    chapter: 4,
    topic: "Establishing Causal Relationships",
    summary:
      "Requires: (1) Covariation, (2) Temporal precedence, (3) Internal validity (no alternative explanations).",
  },
  {
    id: "nhst",
    exam: 2,
    week: 1,
    chapter: 4,
    topic: "Null Hypothesis Significance Testing (NHST)",
    summary:
      "H0 = null hypothesis (status quo). H1 = alternative. Type I error = wrongly reject H0. Type II error = wrongly fail to reject H0.",
  },
  {
    id: "p-value",
    exam: 2,
    week: 1,
    chapter: 4,
    topic: "p-value and Statistical Significance",
    summary:
      "p-value = probability of results if H0 were true. p < .05 = statistically significant = reject H0.",
  },
  {
    id: "alpha",
    exam: 2,
    week: 1,
    chapter: 4,
    topic: "Significance Level (Alpha)",
    summary:
      "Critical threshold; typically .05 or .01. Confidence level = complement of alpha. If p < alpha, reject H0.",
  },
  {
    id: "hypothesis-steps",
    exam: 2,
    week: 1,
    chapter: 4,
    topic: "6 Steps of Hypothesis Testing",
    summary:
      "1) State hypotheses, 2) Choose test, 3) Set alpha, 4) Collect data and compute statistic, 5) Find p-value, 6) Reject or fail to reject H0.",
  },
  {
    id: "iv-dv",
    exam: 2,
    week: 2,
    chapter: 5,
    topic: "Independent and Dependent Variables",
    summary:
      "IV = presumed cause (X), manipulated by researcher. DV = measured effect (Y).",
  },
  {
    id: "random-assignment",
    exam: 2,
    week: 2,
    chapter: 5,
    topic: "Random Assignment",
    summary:
      "Randomly placing participants into conditions. Protects against bias, supports internal validity. Without it = quasi-experiment.",
  },
  {
    id: "random-sampling",
    exam: 2,
    week: 2,
    chapter: 5,
    topic: "Random Sampling vs Random Assignment",
    summary:
      "Random sampling = external validity (generalize to population). Random assignment = internal validity (infer causation).",
  },
  {
    id: "experimental-control",
    exam: 2,
    week: 2,
    chapter: 5,
    topic: "Experimental Control",
    summary:
      "Keeping everything constant except the IV. Prevents confounded variables and threats to internal validity.",
  },
  {
    id: "control-group",
    exam: 2,
    week: 2,
    chapter: 5,
    topic: "Experimental vs Control Group",
    summary:
      "Experimental group receives treatment. Control group does not. Both should be equivalent in all other respects.",
  },
  {
    id: "internal-validity",
    exam: 2,
    week: 2,
    chapter: 5,
    topic: "Internal Validity",
    summary:
      "How confidently we can say IV caused DV. Threats: history, maturation, testing, instrumentation, selection, mortality.",
  },
  {
    id: "quasi-experimental",
    exam: 2,
    week: 2,
    chapter: 5,
    topic: "Quasi-Experimental Designs",
    summary:
      "No random assignment. Designs: one-shot case study, one-group pretest-posttest, static group comparison.",
  },
  {
    id: "true-experimental",
    exam: 2,
    week: 2,
    chapter: 5,
    topic: "True Experimental Designs",
    summary:
      "Includes: pretest-posttest with control, Solomon four-group, after-only with control, factorial designs.",
  },
  {
    id: "factorial",
    exam: 2,
    week: 2,
    chapter: 5,
    topic: "Factorial Design",
    summary:
      "Examines simultaneous effects of two or more IVs on a DV.",
  },
  {
    id: "solomon",
    exam: 2,
    week: 2,
    chapter: 5,
    topic: "Solomon Four-Group Design",
    summary:
      "Groups 1 and 2: classic pretest-posttest. Groups 3 and 4: posttest-only. Comparing them reveals testing effects.",
  },
  {
    id: "confound",
    exam: 2,
    week: 2,
    chapter: 5,
    topic: "Confounded Variable",
    summary:
      "When two variables are mixed so you cannot tell which caused the effect.",
  },
  {
    id: "manipulation-check",
    exam: 2,
    week: 2,
    chapter: 5,
    topic: "Manipulation Check",
    summary:
      "A test to confirm the IV manipulation worked as intended.",
  },
  {
    id: "debriefing",
    exam: 2,
    week: 2,
    chapter: 5,
    topic: "Debriefing (Ethics)",
    summary:
      "Explanation given to participants after the study, disclosing any deception and providing support resources.",
  },
  {
    id: "semantic-diff",
    exam: 2,
    week: 2,
    chapter: 5,
    topic: "Semantic Differential",
    summary:
      "Measurement using opposite-pair scales (Good-Bad, Strong-Weak). Three dominant dimensions: evaluation, potency, activity.",
  },
  {
    id: "double-blind",
    exam: 2,
    week: 2,
    chapter: 5,
    topic: "Double-Blind Experiment",
    summary:
      "Neither subjects nor experimenters know group assignments, reducing bias.",
  },
  {
    id: "independent-t",
    exam: 2,
    week: 3,
    chapter: 6,
    topic: "Independent Samples t-test",
    summary:
      "Compares means of two unrelated groups. df = n1+n2-2.",
  },
  {
    id: "paired-t",
    exam: 2,
    week: 3,
    chapter: 6,
    topic: "Paired Samples t-test",
    summary:
      "Compares means of two related groups (same people measured twice or matched pairs). Uses difference scores.",
  },
  {
    id: "cohens-d",
    exam: 2,
    week: 3,
    chapter: 6,
    topic: "Cohen's d (Effect Size)",
    summary:
      "d = (mean1 - mean2) / S. Measures magnitude of effect independent of sample size. Small=0.2, medium=0.5, large=0.8.",
  },
  {
    id: "effect-size",
    exam: 2,
    week: 3,
    chapter: 6,
    topic: "Effect Size",
    summary:
      "How large or meaningful an effect is, regardless of sample size. Complements statistical significance.",
  },
  {
    id: "between-within",
    exam: 2,
    week: 3,
    chapter: 6,
    topic: "Between-Groups vs Within-Groups Differences",
    summary:
      "Between-groups = differences in group means. Within-groups = variability inside a group (SD). Larger between + smaller within = stronger effect.",
  },

  // Exam 3 concepts
  {
    id: "questionnaire-design",
    exam: 3,
    week: 1,
    chapter: 7,
    topic: "Questionnaire Design",
    summary:
      "Principles for writing clear, unbiased, and answerable questions; ordering questions and sections; avoiding double-barreled and leading items.",
  },
  {
    id: "reliability",
    exam: 3,
    week: 1,
    chapter: 7,
    topic: "Reliability",
    summary:
      "A reliable measure gives consistent results over time. It is assessed using Cronbach's Alpha for internal consistency and test-retest reliability for stability across two separate time points.",
  },
  {
    id: "validity",
    exam: 3,
    week: 1,
    chapter: 7,
    topic: "Validity",
    summary:
      "Extent to which a measure captures what it is intended to measure. Includes content, criterion, and construct validity.",
  },
  {
    id: "anova",
    exam: 3,
    week: 1,
    chapter: 7,
    topic: "ANOVA",
    summary:
      "Analysis of Variance comparing means across 3+ groups; partitions variance into between-groups and within-groups components.",
  },
  {
    id: "survey-response",
    exam: 3,
    week: 2,
    chapter: 8,
    topic: "Survey Response",
    summary:
      "How respondents interpret, retrieve, judge, and map answers to response formats; impacted by question wording and context.",
  },
  {
    id: "satisficing",
    exam: 3,
    week: 2,
    chapter: 8,
    topic: "Satisficing",
    summary:
      "When respondents take mental shortcuts instead of carefully answering — caused by low motivation, low ability, or high task difficulty — leading to behaviors like picking the first reasonable option or agreeing with everything.",
  },
  {
    id: "ratings-vs-rankings",
    exam: 3,
    week: 2,
    chapter: 8,
    topic: "Ratings vs Rankings",
    summary:
      "Ratings are easier, faster, and give more information but don't force differentiation between options. Rankings force the respondent to choose but are harder and slower. Use rankings only when real life actually forces a choice.",
  },
  {
    id: "sampling-methods",
    exam: 3,
    week: 3,
    chapter: 9,
    topic: "Sampling Methods",
    summary:
      "Probability (simple random, stratified, cluster, systematic) vs non-probability (convenience, quota, snowball) samples and their tradeoffs.",
  },
  {
    id: "chi-square",
    exam: 3,
    week: 4,
    chapter: 10,
    topic: "Chi-Square and Hypothesis Testing",
    summary:
      "Used to test the association between two categorical variables. The chi-square statistic measures how far the observed counts deviate from what you would expect if there were no relationship. Degrees of freedom = (rows - 1)(columns - 1).",
  },
] satisfies readonly Concept[];

export const CONCEPTS: readonly Concept[] = concepts;
export const WEEKS = [1, 2, 3, 4] as const;

