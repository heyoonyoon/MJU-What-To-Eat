import React, { useEffect, useRef } from "react";

import type { Restaurant } from "../types/restaurant";
import { restaurants } from "../data2";
import { useLang } from "../LangContext";
import {
  computeClusters,
  buildClusterContent,
  buildSingleMarkerContent,
  buildStackedMarkerContent,
  type MarkerModes,
} from "./clusterMarkers";

export type { MarkerModeKey, MarkerModes } from "./clusterMarkers";

interface NaverMapProps {
  displayList?: Restaurant[];
  focusTarget?: Restaurant | null;
  onMarkerClick?: (restaurant: Restaurant) => void;
  markerModes?: MarkerModes;
  filteredMenuIds?: Set<string> | null;
}

const DEFAULT_MODES: MarkerModes = new Set(["price"]);

const NaverMap: React.FC<NaverMapProps> = ({
  displayList,
  focusTarget,
  onMarkerClick,
  markerModes = DEFAULT_MODES,
  filteredMenuIds,
}) => {
  const { lang } = useLang();

  const mapElement = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<naver.maps.Map | null>(null);

  // 현재 표시 중인 마커들 (클러스터 + 단일 모두)
  const activeMarkersRef = useRef<naver.maps.Marker[]>([]);

  // 최신 값을 ref로 유지 (클로저 stale 방지)
  const displayListRef = useRef<Restaurant[] | undefined>(displayList);
  const markerModesRef = useRef<MarkerModes>(markerModes);
  const filteredMenuIdsRef = useRef<Set<string> | null | undefined>(
    filteredMenuIds,
  );
  const langRef = useRef(lang);

  displayListRef.current = displayList;
  markerModesRef.current = markerModes;
  filteredMenuIdsRef.current = filteredMenuIds;
  langRef.current = lang;

  /** 기존 마커를 모두 제거하고 새로 그린다 */
  const redrawMarkers = useRef<(() => void) | null>(null);

  // focusTarget 변경 시 해당 위치로 이동
  useEffect(() => {
    if (!focusTarget || !mapRef.current) return;
    if (!focusTarget.lat || !focusTarget.lng) return;
    mapRef.current.panTo(
      new window.naver.maps.LatLng(focusTarget.lat, focusTarget.lng),
    );
  }, [focusTarget]);

  // displayList / markerModes / filteredMenuIds / lang 변경 시 마커 재렌더
  useEffect(() => {
    redrawMarkers.current?.();
  }, [displayList, markerModes, filteredMenuIds, lang]);

  // 지도 + 마커 초기화 (최초 1회)
  useEffect(() => {
    if (!window.naver || !mapElement.current) return;

    const map = new window.naver.maps.Map(mapElement.current, {
      center: new window.naver.maps.LatLng(37.5792, 126.9239),
      zoom: 17,
      minZoom: 15,
      maxZoom: 21,
      scrollWheel: true,
      zoomControl: false,
      mapTypeControl: false,
      logoControl: false,
    });

    mapRef.current = map;

    /** 마커 전체 다시 그리기 */
    function redraw() {
      // 기존 마커 제거
      activeMarkersRef.current.forEach((m) => m.setMap(null));
      activeMarkersRef.current = [];

      const visible = displayListRef.current ?? restaurants;
      const { clusters, singles, stackedGroups } = computeClusters(
        visible,
        map,
      );

      // ── 클러스터 버블 마커 (3개 이상, 가격 요약 표시) ──
      clusters.forEach((cluster) => {
        const marker = new window.naver.maps.Marker({
          position: new window.naver.maps.LatLng(cluster.lat, cluster.lng),
          map,
          icon: {
            content: buildClusterContent(
              cluster.restaurants,
              langRef.current,
              filteredMenuIdsRef.current,
            ),
            anchor: new window.naver.maps.Point(22, 22),
          },
          zIndex: 100,
        });

        window.naver.maps.Event.addListener(marker, "click", () => {
          const currentZoom = map.getZoom();
          map.setZoom(currentZoom + 2, true);
          map.panTo(new window.naver.maps.LatLng(cluster.lat, cluster.lng));
        });

        activeMarkersRef.current.push(marker);
      });

      // ── 수직 나열 그룹 (같은 건물, 2개 이상) ──
      stackedGroups.forEach((group) => {
        // 그룹 전체를 하나의 마커로 표시 (수직 pill 스택)
        const marker = new window.naver.maps.Marker({
          position: new window.naver.maps.LatLng(group.lat, group.lng),
          map,
          icon: {
            content: buildStackedMarkerContent(
              group.restaurants,
              langRef.current,
              markerModesRef.current,
              filteredMenuIdsRef.current,
            ),
            // anchor는 스택 중앙 상단으로 (대략)
            anchor: new window.naver.maps.Point(0, 0),
          },
          zIndex: 50,
        });

        // 클릭 시 첫 번째 가게 열기 (혹은 zoom in)
        window.naver.maps.Event.addListener(marker, "click", () => {
          if (group.restaurants.length === 1) {
            onMarkerClick?.(group.restaurants[0]);
          } else {
            const currentZoom = map.getZoom();
            if (currentZoom < 20) {
              map.setZoom(currentZoom + 1, true);
              map.panTo(new window.naver.maps.LatLng(group.lat, group.lng));
            } else {
              // 최대 줌이면 첫 번째 가게 열기
              onMarkerClick?.(group.restaurants[0]);
            }
          }
        });

        activeMarkersRef.current.push(marker);
      });

      // ── 단일 마커 ──
      singles.forEach((shop) => {
        if (!shop.lat || !shop.lng) return;
        const marker = new window.naver.maps.Marker({
          position: new window.naver.maps.LatLng(shop.lat, shop.lng),
          map,
          icon: {
            content: buildSingleMarkerContent(
              shop,
              langRef.current,
              markerModesRef.current,
              filteredMenuIdsRef.current,
            ),
            anchor: new window.naver.maps.Point(12, 12),
          },
          zIndex: 10,
        });

        window.naver.maps.Event.addListener(marker, "click", () => {
          map.panTo(marker.getPosition());
          onMarkerClick?.(shop);
        });

        activeMarkersRef.current.push(marker);
      });
    }

    redrawMarkers.current = redraw;

    // 초기 렌더
    redraw();

    // 줌/이동 끝날 때마다 재클러스터링
    window.naver.maps.Event.addListener(map, "zoom_changed", redraw);
    window.naver.maps.Event.addListener(map, "dragend", redraw);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={mapElement}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
      }}
    />
  );
};

export default NaverMap;
