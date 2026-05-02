/** Must match backend VisitorPurpose enum names (same as nestiti/app/constants/visitorCheckIn). */
export type VisitorPurposeCode =
  | "FOOD_DELIVERY"
  | "PACKAGE_DELIVERY"
  | "RELATIVES_FRIENDS"
  | "OTHER";

export const PURPOSE_LABELS: Record<VisitorPurposeCode, string> = {
  FOOD_DELIVERY: "Food delivery",
  PACKAGE_DELIVERY: "Package delivery",
  RELATIVES_FRIENDS: "Relatives / friends",
  OTHER: "Other",
};

export const PURPOSE_OPTIONS: { value: VisitorPurposeCode; label: string }[] = (
  Object.keys(PURPOSE_LABELS) as VisitorPurposeCode[]
).map((value) => ({ value, label: PURPOSE_LABELS[value] }));
