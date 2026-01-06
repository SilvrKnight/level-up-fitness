export interface JournalEntry {
  id: string;
  user_id: string;
  entry_date: string;
  energy_level: number;
  plan_followed: boolean;
  plan_deviation_reason: string | null;
  what_went_well: string;
  what_was_difficult: string;
  what_i_learned: string;
  tomorrow_goal: string;
  additional_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface JournalEntryFormData {
  energy_level: number;
  plan_followed: boolean;
  plan_deviation_reason: string;
  what_went_well: string;
  what_was_difficult: string;
  what_i_learned: string;
  tomorrow_goal: string;
  additional_notes: string;
}

export const EMPTY_JOURNAL_FORM: JournalEntryFormData = {
  energy_level: 0,
  plan_followed: true,
  plan_deviation_reason: '',
  what_went_well: '',
  what_was_difficult: '',
  what_i_learned: '',
  tomorrow_goal: '',
  additional_notes: '',
};
