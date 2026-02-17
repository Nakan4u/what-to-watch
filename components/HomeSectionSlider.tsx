"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import type { TmdbTitle } from "@/lib/tmdb";
import TitleCard from "./TitleCard";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

import "swiper/css";
import "swiper/css/navigation";

export interface TitleWithGenres {
  title: TmdbTitle;
  genreNames: string[];
}

export interface HomeSectionSliderProps {
  /** Section heading (e.g. "In theaters", "Popular movies") */
  title: string;
  /** Titles with pre-computed genre names (serializable from server) */
  items: TitleWithGenres[];
  /** Unique key prefix for this section (e.g. "now", "movie", "tv") */
  sectionKey: string;
}

export default function HomeSectionSlider({
  title,
  items,
  sectionKey,
}: HomeSectionSliderProps) {
  if (items.length === 0) {
    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4, textAlign: "center" }}>
          {title}
        </Typography>
        <Typography color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
          No titles in this section.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4, textAlign: "center" }}>
        {title}
      </Typography>
      <Swiper
        modules={[Navigation]}
        spaceBetween={16}
        slidesPerView="auto"
        navigation
        className="home-section-swiper"
        style={{
          paddingTop: 8,
          paddingBottom: 24,
          marginLeft: 0,
          marginRight: 0,
        }}
      >
        {items.map(({ title: titleItem, genreNames }) => (
          <SwiperSlide key={`${sectionKey}-${titleItem.id}`}>
            <Box sx={{ height: "100%" }}>
              <TitleCard
                title={titleItem}
                genreNames={genreNames}
              />
            </Box>
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
}
