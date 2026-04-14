import React, { useEffect, useRef } from "react";

import type { Restaurant } from "../data2";

import { restaurants } from "../data2";

interface NaverMapProps {
  displayList?: Restaurant[];
  focusTarget?: Restaurant | null;
  onMarkerClick?: (restaurant: Restaurant) => void;
}

const NaverMap: React.FC<NaverMapProps> = ({
  displayList,
  focusTarget,
  onMarkerClick,
}) => {
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

  // focusTarget 변경 시 해당 위치로 이동
  useEffect(() => {
    if (!focusTarget || !mapRef.current) return;
    if (!focusTarget.lat || !focusTarget.lng) return;

    mapRef.current.panTo(
      new window.naver.maps.LatLng(focusTarget.lat, focusTarget.lng),
    );
  }, [focusTarget]);

  // 지도 + 마커 초기화 (최초 1회)

  useEffect(() => {
    if (!window.naver || !mapElement.current) return;

    const map = new window.naver.maps.Map(mapElement.current, {
      center: new window.naver.maps.LatLng(37.5802, 126.9227),

      zoom: 17,

      minZoom: 15,

      maxZoom: 21,

      scrollWheel: true,

      zoomControl: false,

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
          content: (() => {
            const primaryMenuNames = shop.menus
              .filter((m) => m.isPrimary)
              .map((m) => m.name.ko)
              .join(", ");
            const priceText =
              shop.minPrice != null
                ? `${shop.minPrice.toLocaleString()}원~`
                : "";
            const line1 = priceText;
            const line2 = primaryMenuNames;
            return `<div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;"><div style="background:white;padding:4px 8px;border-radius:10px;border:1.5px solid #FF4D4D;font-size:11px;font-weight:700;color:#333;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.15);line-height:1.5;">${line1 ? `<div style="color:#FF4D4D;">${line1}</div>` : ""}${line2 ? `<div>${line2}</div>` : ""}</div></div>`;
          })(),

          anchor: new window.naver.maps.Point(12, 12),
        },
      });

      window.naver.maps.Event.addListener(marker, "click", () => {
        map.panTo(marker.getPosition());
        onMarkerClick?.(shop);
      });

      markerMapRef.current.set(shop.id, marker);
    });
  }, []);

  return (
    <div
      ref={mapElement}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
      }}
    />
  );
};

export default NaverMap;
