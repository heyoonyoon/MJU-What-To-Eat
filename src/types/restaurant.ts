export interface Restaurant {
  id: string;
  name: string;
  category:
    | "한식"
    | "일식"
    | "중식"
    | "간편식·분식"
    | "고기"
    | "양식·아시안"
    | "주류"
    | "카페·디저트"
    | "종합";
  type: "식사" | "술집"   | "카페";
  zone: "정문" | "A" | "B" | "C";
  solo: boolean;
  address: string;
  roadAddress: string;
  mapx: string;
  mapy: string;
  lat: number;
  lng: number;

  naverMapCode?: number;

  filters?: {
    isCheap: boolean;
    isHighProtein: boolean;
    isHealthy: boolean;
  };

  minPrice?: number | null;
  menus?: Menu[];
}

export interface Menu {
  menuId: string;
  isPrimary?: boolean;
  price?: number;
  name: {
    ko: string;
    en: string;
    zh: string;
    ja: string;
    vi: string;
  };
  tags?: string[];
}
