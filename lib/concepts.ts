import type { Concept } from "@/lib/types";

const concepts = [
  { id: "pearson-r", week: 1, chapter: 4, topic: "Pearson r Correlation", summary: "Numeric measure of linear association between two continuous variables. Range: -1 to +1. Does not imply causation." },
  { id: "spearman", week: 1, chapter: 4, topic: "Spearman's Rank-Order Coefficient", summary: "Measures association between two ordinal/ranked variables. Range: -1 to +1." },
  { id: "phi", week: 1, chapter: 4, topic: "Phi Coefficient", summary: "Measures linear relationship between two dichotomous (binary) variables. Range: -1 to +1." },
  { id: "point-biserial", week: 1, chapter: 4, topic: "Point-Biserial Correlation", summary: "Special case of Pearson r for one dichotomous and one continuous variable." },
  { id: "causal-relationships", week: 1, chapter: 4, topic: "Establishing Causal Relationships", summary: "Requires: (1) Covariation, (2) Temporal precedence, (3) Internal validity (no alternative explanations)." },
  { id: "nhst", week: 1, chapter: 4, topic: "Null Hypothesis Significance Testing (NHST)", summary: "H0 = null hypothesis (status quo). H1 = alternative. Type I error = wrongly reject H0. Type II error = wrongly fail to reject H0." },
  { id: "p-value", week: 1, chapter: 4, topic: "p-value and Statistical Significance", summary: "p-value = probability of results if H0 were true. p < .05 = statistically significant = reject H0." },
  { id: "alpha", week: 1, chapter: 4, topic: "Significance Level (Alpha)", summary: "Critical threshold; typically .05 or .01. Confidence level = complement of alpha. If p < alpha, reject H0." },
  { id: "hypothesis-steps", week: 1, chapter: 4, topic: "6 Steps of Hypothesis Testing", summary: "1) State hypotheses, 2) Choose test, 3) Set alpha, 4) Collect data and compute statistic, 5) Find p-value, 6) Reject or fail to reject H0." },
  { id: "iv-dv", week: 2, chapter: 5, topic: "Independent and Dependent Variables", summary: "IV = presumed cause (X), manipulated by researcher. DV = measured effect (Y)." },
  { id: "random-assignment", week: 2, chapter: 5, topic: "Random Assignment", summary: "Randomly placing participants into conditions. Protects against bias, supports internal validity. Without it = quasi-experiment." },
  { id: "random-sampling", week: 2, chapter: 5, topic: "Random Sampling vs Random Assignment", summary: "Random sampling = external validity (generalize to population). Random assignment = internal validity (infer causation)." },
  { id: "experimental-control", week: 2, chapter: 5, topic: "Experimental Control", summary: "Keeping everything constant except the IV. Prevents confounded variables and threats to internal validity." },
  { id: "control-group", week: 2, chapter: 5, topic: "Experimental vs Control Group", summary: "Experimental group receives treatment. Control group does not. Both should be equivalent in all other respects." },
  { id: "internal-validity", week: 2, chapter: 5, topic: "Internal Validity", summary: "How confidently we can say IV caused DV. Threats: history, maturation, testing, instrumentation, selection, mortality." },
  { id: "quasi-experimental", week: 2, chapter: 5, topic: "Quasi-Experimental Designs", summary: "No random assignment. Designs: one-shot case study, one-group pretest-posttest, static group comparison." },
  { id: "true-experimental", week: 2, chapter: 5, topic: "True Experimental Designs", summary: "Includes: pretest-posttest with control, Solomon four-group, after-only with control, factorial designs." },
  { id: "factorial", week: 2, chapter: 5, topic: "Factorial Design", summary: "Examines simultaneous effects of two or more IVs on a DV." },
  { id: "solomon", week: 2, chapter: 5, topic: "Solomon Four-Group Design", summary: "Groups 1 and 2: classic pretest-posttest. Groups 3 and 4: posttest-only. Comparing them reveals testing effects." },
  { id: "confound", week: 2, chapter: 5, topic: "Confounded Variable", summary: "When two variables are mixed so you cannot tell which caused the effect." },
  { id: "manipulation-check", week: 2, chapter: 5, topic: "Manipulation Check", summary: "A test to confirm the IV manipulation worked as intended." },
  { id: "debriefing", week: 2, chapter: 5, topic: "Debriefing (Ethics)", summary: "Explanation given to participants after the study, disclosing any deception and providing support resources." },
  { id: "semantic-diff", week: 2, chapter: 5, topic: "Semantic Differential", summary: "Measurement using opposite-pair scales (Good-Bad, Strong-Weak). Three dominant dimensions: evaluation, potency, activity." },
  { id: "double-blind", week: 2, chapter: 5, topic: "Double-Blind Experiment", summary: "Neither subjects nor experimenters know group assignments, reducing bias." },
  { id: "independent-t", week: 3, chapter: 6, topic: "Independent Samples t-test", summary: "Compares means of two unrelated groups. df = n1+n2-2." },
  { id: "paired-t", week: 3, chapter: 6, topic: "Paired Samples t-test", summary: "Compares means of two related groups (same people measured twice or matched pairs). Uses difference scores." },
  { id: "cohens-d", week: 3, chapter: 6, topic: "Cohen's d (Effect Size)", summary: "d = (mean1 - mean2) / S. Measures magnitude of effect independent of sample size. Small=0.2, medium=0.5, large=0.8." },
  { id: "effect-size", week: 3, chapter: 6, topic: "Effect Size", summary: "How large or meaningful an effect is, regardless of sample size. Complements statistical significance." },
  { id: "between-within", week: 3, chapter: 6, topic: "Between-Groups vs Within-Groups Differences", summary: "Between-groups = differences in group means. Within-groups = variability inside a group (SD). Larger between + smaller within = stronger effect." }
 ] satisfies readonly Concept[];

export const CONCEPTS: readonly Concept[] = concepts;
export const WEEKS = [1, 2, 3] as const;

