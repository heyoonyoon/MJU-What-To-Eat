import React from "react";

interface YoutubeShortsProps {
  url: string;
}

const YoutubeShorts: React.FC<YoutubeShortsProps> = ({ url }) => {
  const getYouTubeID = (url: string): string | null => {
    const regExp =
      /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|[&]v(?:i)?=))([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[1].length === 11 ? match[1] : null;
  };

  const videoId = getYouTubeID(url);

  if (!videoId) {
    return (
      <div
        style={{
          color: "#ef4444",
          padding: "1rem",
          border: "1px solid #fee2e2",
          borderRadius: "0.5rem",
        }}
      >
        유효하지 않은 유튜브 주소입니다.
      </div>
    );
  }

  // 자동재생(autoplay), 음소거(mute), 반복재생(loop) 파라미터 조합
  // loop를 쓰려면 playlist 파라미터에 내 영상 ID를 한 번 더 넣어줘야 함
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}`;

  return (
    <div
      style={{
        position: "relative",
        paddingBottom: "177.77%",
        height: 0,
        overflow: "hidden",
        maxWidth: "400px",
        borderRadius: "16px",
        backgroundColor: "#000",
      }}
    >
      <iframe
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
        src={embedUrl}
        title="YouTube Shorts player"
        frameBorder="0"
        // 자동재생 권한 허용을 위해 'autoplay' 추가 필수
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default YoutubeShorts;
