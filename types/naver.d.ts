/* eslint-disable @typescript-eslint/no-explicit-any */
// src/types/naver.d.ts

declare namespace naver.maps {
  interface MapOptions {
    [key: string]: any;
  }

  class Map {
    constructor(element: HTMLElement, options?: MapOptions);
    panTo(position: LatLng): void;
    [key: string]: any;
  }

  class Marker {
    constructor(options: { [key: string]: any });
    setMap(map: Map | null): void;
    getPosition(): LatLng;
    [key: string]: any;
  }
}

// 혹시 window.naver 자체를 못 잡는다면 아래도 추가
interface Window {
  naver: any;
}
