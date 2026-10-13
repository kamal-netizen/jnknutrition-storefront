"use client";

import { getImageProps, type ImageProps } from "next/image";
import { preload } from "react-dom";

type Props = Pick<ImageProps, "src" | "sizes" | "fill" | "width" | "height"> & {
  /** The viewports that show the image above the fold. */
  media: string;
  fetchPriority?: "high" | "low" | "auto";
};

/**
 * A `<link rel="preload">` for a next/image, scoped to the viewports that show
 * it above the fold. next/image's own `preload` (née `priority`) can't take a
 * media query, so it preloads everywhere.
 *
 * Render it before the `<Image>` it warms, with the same `src` and `sizes`.
 * React already preloads every non-lazy `<img>` it server-renders, and with no
 * media query; it keys image preloads on srcset + sizes, so claiming that key
 * first is what keeps the unscoped one out of `<head>`.
 *
 * A client component because the loader file is one: getImageProps can't call
 * it from the server.
 */
export default function ImagePreload({ media, fetchPriority, ...image }: Props) {
  const { props } = getImageProps({ ...image, alt: "" });
  preload(props.src, {
    as: "image",
    imageSrcSet: props.srcSet,
    imageSizes: props.sizes,
    fetchPriority,
    media,
  });
  return null;
}
