// React Imports
import type { HTMLAttributes } from 'react'

interface LogoProps extends Omit<HTMLAttributes<HTMLImageElement>, 'src' | 'alt'> {
  width?: number
  height?: number
}

const Logo = ({ width = 35, height = 24, className, style, ...props }: LogoProps) => {
  return (
    <img
      src='/images/logo.png'
      alt='Logo'
      width={width}
      height={height}
      className={className}
      style={{
        objectFit: 'contain',
        ...style
      }}
      {...props}
    />
  )
}

export default Logo
