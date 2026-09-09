// Label auto-filled for bank-CSV rows with an empty Verwendungszweck.
// These are always internal transfers between the user's own accounts
// (Hauptkonto <-> Privatkonto), so they're excluded from Gesamteinnahmen/
// -ausgaben (they aren't real business income or expense) while still
// counting toward the account balance (the money did actually move).
export const GELDTRANSIT_LABEL = "Geldtransit";

// Starting set for the Bargeld tab's expense categories — fully editable by
// the user (add/remove), this is just a sensible first-run default.
export const DEFAULT_CASH_CATEGORIES = ["Wareneinkauf", "Trinkgeld", "Fahrtkosten", "Verpflegung", "Sonstiges"];
