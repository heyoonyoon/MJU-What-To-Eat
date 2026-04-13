import React, { useEffect, useRef } from "react";

import type { Restaurant } from "../data";

import { restaurants } from "../data";

import heartIcon from "../assets/markers/heart.png";

interface NaverMapProps {
  displayList?: Restaurant[];
}

const NaverMap: React.FC<NaverMapProps> = ({ displayList }) => {
  const mapElement = useRef<HTMLDivElement | null>(null);

  const mapRef = useRef<naver.maps.Map | null>(null);

  const markerMapRef = useRef<Map<string, naver.maps.Marker>>(new Map());

  const displayListRef = useRef<Restaurant[] | undefined>(displayList);

  // displayList 변경 시 마커 show/hide

  useEffect(() => {
    displayListRef.current = displayList;

    if (markerMapRef.current.size === 0) return; // 마커 아직 없으면 스킵

    const visibleSet = new Set((displayList ?? restaurants).map((r) => r.id));

    markerMapRef.current.forEach((marker, id) => {
      marker.setMap(visibleSet.has(id) ? mapRef.current : null);
    });
  }, [displayList]);

  // 지도 + 마커 초기화 (최초 1회)

  useEffect(() => {
    if (!window.naver || !mapElement.current) return;

    const map = new window.naver.maps.Map(mapElement.current, {
      center: new window.naver.maps.LatLng(37.5802, 126.9227),

      zoom: 17,

      minZoom: 15,

      maxZoom: 21,

      scrollWheel: true,

      zoomControl: true,

      mapTypeControl: false,

      logoControlOptions: {
        position: window.naver.maps.Position.BOTTOM_LEFT,
      },
    });

    mapRef.current = map;

    // 마커 생성 후 초기 displayList 상태 적용

    const initialVisible = new Set(
      (displayListRef.current ?? restaurants).map((r) => r.id),
    );

    restaurants.forEach((shop) => {
      if (!shop.lat || !shop.lng) return;

      const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(shop.lat, shop.lng),

        map: initialVisible.has(shop.id) ? map : null,

        icon: {
          content: `

<div style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">

<img src="${heartIcon}" style="width: 24px; height: 24px;" />

<div style="

background: white;

padding: 3px 7px;

border-radius: 20px;

border: 1.5px solid #FF4D4D;

font-size: 11px;

font-weight: 800;

color: #333;

white-space: nowrap;

margin-top: 2px;

box-shadow: 0 2px 6px rgba(0,0,0,0.15);

">

${shop.name}

</div>

</div>

`,

          anchor: new window.naver.maps.Point(12, 12),
        },
      });

      window.naver.maps.Event.addListener(marker, "click", () => {
        map.panTo(marker.getPosition());
      });

      markerMapRef.current.set(shop.id, marker);
    });
  }, []);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 mt-6">
      <div
        ref={mapElement}
        style={{
          width: "100%",

          height: "calc(100vh - 200px)",

          borderRadius: "20px",

          overflow: "hidden",

          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        }}
      />
    </div>
  );
};

export default NaverMap;
