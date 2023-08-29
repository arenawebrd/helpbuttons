///image included in ButtonCard
///Btn is the project convention for tradittional buttons, in order to avoidd confussion with app's buttons
import React from 'react';
import Image from 'next/image'
import { makeImageUrl } from 'shared/sys.helper';

export enum ImageType {
  avatar,
  popup,
  marker,
  cardMap,
  cardList,
  buttonCard,
  avatarBig
}

export enum ContentAlignment {
  left,
  center,
  right,
}

interface ImageProps {
  height?: number;
  width?: number;
  layout?: string;
  src: string;
  alt: string;
  objectFit?: string;
  imageType: ImageType;
  localUrl?: boolean;
}

export default function ImageWrapper({
  height = 200,
  width = 200,
  alt = null,
  layout = 'responsive',
  src = null,
  objectFit = 'contain',
  imageType = ImageType.popup,
  localUrl = false,
}: ImageProps) {
  let classNames = [];

  const className = classNames.join(' ');

  if(imageType == ImageType.avatar) 
  {
    return (
      <Image
      src={makeImageUrl(src, '/api')}
      alt={alt}
      width={30}
      height={30}
    />
    )
  }
  if(imageType == ImageType.avatarBig) 
  {
    return (
      <Image
      src={makeImageUrl(src, '/api')}
      alt={alt}
      width={68}
      height={68}
    />
    )
  }
  return (
    <Image
      src={makeImageUrl(src, '/api')}
      alt={alt}
      fill={true}
    />
  );
}

export function ImageContainer({
  height = 200,
  width = 200,
  alt = null,
  src = '',
  localUrl = false,
}) {
  let classNames = [];

  const className = classNames.join(' ');
  
  return (
    <Image src={makeImageUrl(src, '/api')} alt={alt} width={width} height={height} />
  );
}
