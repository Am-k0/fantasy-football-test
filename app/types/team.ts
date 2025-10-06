export type Player = {
  id: number;
  name: string;
  team: string | null;
  position: string;
  avatar: string;
  fantasyPoints: number;
  salary: number;
};

export type Slot = {
  id: number;
  label: string;
  type: string;
  x: number | null;
  y: number | null;
  player: Player | null;
  isBench: boolean;
};