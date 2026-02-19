"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { Card, CardContent, Typography, Box } from "@mui/material";
import type { TmdbCastMember } from "@/lib/tmdb";
import { profileImageUrl } from "@/lib/tmdb";

import "swiper/css";
import "swiper/css/navigation";

const SLIDE_WIDTH = 140;

export interface CastSliderProps {
  title: string;
  cast: TmdbCastMember[];
}

export default function CastSlider({ title, cast }: CastSliderProps) {
  if (cast.length === 0) return null;

  return (
    <Box sx={{ mb: 4 }}>
      <Typography
        variant="h5"
        component="h2"
        gutterBottom
        sx={{ mt: 4, textAlign: "center" }}
      >
        {title}
      </Typography>
      <Swiper
        modules={[Navigation]}
        spaceBetween={16}
        slidesPerView="auto"
        navigation
        className="cast-swiper"
        style={{
          paddingTop: 8,
          paddingBottom: 24,
          marginLeft: 0,
          marginRight: 0,
        }}
      >
        {cast.map((member) => (
          <SwiperSlide
            key={`cast-${member.id}-${member.character}`}
            style={{ width: SLIDE_WIDTH }}
          >
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  aspectRatio: "2/3",
                  overflow: "hidden",
                  bgcolor: "grey.300",
                }}
              >
                <Box
                  component="img"
                  src={profileImageUrl(member.profile_path) ?? undefined}
                  alt={member.name}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </Box>
              <CardContent sx={{ py: 1, px: 1.5, "&:last-child": { pb: 1.5 } }}>
                <Typography
                  variant="subtitle2"
                  noWrap
                  title={member.name}
                  sx={{ fontWeight: 600 }}
                >
                  {member.name}
                </Typography>
                {member.character && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    noWrap
                    display="block"
                    title={member.character}
                  >
                    {member.character}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
}
