/**
 * What kind of rendering a maqām or jins form is:
 *
 * - "base": the base form, the form on the tonic the sources give (maqām rāst on rāst)
 * - "transposition": a taṣwīr, moved to another modal degree (maqām rāst on nawā)
 * - "octaveRendering": the base form one or more octaves away, on the same modal
 *   degree (maqām rāst on qarār rāst); neither the base form nor a taṣwīr
 *
 * Read from the form's own flags, never from its name.
 */
export type FormType = "base" | "transposition" | "octaveRendering";

export function formTypeOf(form: { isBaseForm: boolean; transposition: boolean }): FormType {
  if (form.isBaseForm && form.transposition) {
    throw new Error("A form cannot be both the base form and a taṣwīr.");
  }
  if (form.isBaseForm) return "base";
  return form.transposition ? "transposition" : "octaveRendering";
}
