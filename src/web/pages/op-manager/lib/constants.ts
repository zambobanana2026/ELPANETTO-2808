// Label auto-filled for bank-CSV rows with an empty Verwendungszweck.
// These are always internal transfers between the user's own accounts
// (Hauptkonto <-> Privatkonto), so they're excluded from Gesamteinnahmen/
// -ausgaben (they aren't real business income or expense) while still
// counting toward the account balance (the money did actually move).
export const GELDTRANSIT_LABEL = "Geldtransit";
