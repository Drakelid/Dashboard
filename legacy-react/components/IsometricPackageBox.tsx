import { motion } from "motion/react";
import { Package } from "lucide-react";

interface IsometricPackageBoxProps {
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  weight?: string;
  className?: string;
  showDimensions?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export function IsometricPackageBox({ 
  dimensions, 
  weight, 
  className = "", 
  showDimensions = true,
  size = 'medium'
}: IsometricPackageBoxProps) {
  const { length, width, height } = dimensions;
  
  // Enhanced size scaling with better proportional representation
  const sizeConfig = {
    small: { baseSize: 60, iconSize: 12, textSize: 'text-xs', minSize: 20 },
    medium: { baseSize: 80, iconSize: 16, textSize: 'text-sm', minSize: 25 },
    large: { baseSize: 120, iconSize: 20, textSize: 'text-base', minSize: 30 }
  };
  
  const config = sizeConfig[size];
  
  // Enhanced proportional scaling to better represent actual dimensions
  const maxDim = Math.max(length, width, height);
  const minDim = Math.min(length, width, height);
  
  // Use a more sophisticated scaling that maintains proportions better
  const baseScale = config.baseSize / maxDim;
  
  // Ensure minimum visibility for very small dimensions
  const scaledLength = Math.max(length * baseScale, config.minSize);
  const scaledWidth = Math.max(width * baseScale, config.minSize);  
  const scaledHeight = Math.max(height * baseScale, config.minSize);
  
  // Calculate aspect ratios for better visual representation
  const lengthRatio = length / maxDim;
  const widthRatio = width / maxDim;
  const heightRatio = height / maxDim;
  
  // Apply ratios to create more accurate proportional representation
  const finalLength = Math.round(config.baseSize * lengthRatio);
  const finalWidth = Math.round(config.baseSize * widthRatio);
  const finalHeight = Math.round(config.baseSize * heightRatio);
  
  // Enhanced isometric projection for better depth visibility - using precise coordinates
  const perspectiveRatio = 0.8;
  const depthRatio = 0.6;
  const depthOffset = Math.round(finalWidth * perspectiveRatio);
  const heightOffset = Math.round(finalWidth * depthRatio);
  
  // Calculate face points with precise integer coordinates for perfect alignment
  const frontFace = [
    { x: 0, y: finalHeight },
    { x: finalLength, y: finalHeight },
    { x: finalLength, y: 0 },
    { x: 0, y: 0 }
  ];
  
  const rightFace = [
    { x: finalLength, y: finalHeight },
    { x: finalLength + depthOffset, y: finalHeight - heightOffset },
    { x: finalLength + depthOffset, y: -heightOffset },
    { x: finalLength, y: 0 }
  ];
  
  const topFace = [
    { x: 0, y: 0 },
    { x: finalLength, y: 0 },
    { x: finalLength + depthOffset, y: -heightOffset },
    { x: depthOffset, y: -heightOffset }
  ];

  // Calculate realistic shadow - parallelogram matching the bottom face
  const shadowOffset = 6; // Distance from package base
  const shadowSkew = 0.3; // Skew factor for realistic shadow perspective
  const shadowOpacity = 0.2;
  
  const shadowPoints = [
    { x: 0 + shadowSkew * finalHeight, y: finalHeight + shadowOffset },
    { x: finalLength + shadowSkew * finalHeight, y: finalHeight + shadowOffset },
    { x: finalLength + depthOffset + shadowSkew * finalHeight, y: finalHeight - heightOffset + shadowOffset },
    { x: depthOffset + shadowSkew * finalHeight, y: finalHeight - heightOffset + shadowOffset }
  ];

  // Simplified path creation with rounded corners for smooth edges
  const createPath = (points: { x: number; y: number }[], cornerRadius: number = 3) => {
    if (points.length < 3) return '';
    
    let path = '';
    
    for (let i = 0; i < points.length; i++) {
      const current = points[i];
      const next = points[(i + 1) % points.length];
      const prev = points[(i - 1 + points.length) % points.length];
      
      if (i === 0) {
        // Move to first point with corner radius
        const dx = current.x - prev.x;
        const dy = current.y - prev.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len > cornerRadius * 2) {
          const ux = dx / len;
          const uy = dy / len;
          path += `M ${current.x - ux * cornerRadius} ${current.y - uy * cornerRadius}`;
        } else {
          path += `M ${current.x} ${current.y}`;
        }
      }
      
      // Calculate vectors for smooth corners
      const dx1 = current.x - prev.x;
      const dy1 = current.y - prev.y;
      const dx2 = next.x - current.x;
      const dy2 = next.y - current.y;
      
      const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
      const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
      
      if (len1 > 0 && len2 > 0) {
        const ux1 = dx1 / len1;
        const uy1 = dy1 / len1;
        const ux2 = dx2 / len2;
        const uy2 = dy2 / len2;
        
        const radius = Math.min(cornerRadius, len1 / 2, len2 / 2);
        
        const cp1x = current.x - ux1 * radius;
        const cp1y = current.y - uy1 * radius;
        const cp2x = current.x + ux2 * radius;
        const cp2y = current.y + uy2 * radius;
        
        // Line to corner start
        path += ` L ${cp1x} ${cp1y}`;
        // Smooth corner
        path += ` Q ${current.x} ${current.y} ${cp2x} ${cp2y}`;
      } else {
        path += ` L ${current.x} ${current.y}`;
      }
    }
    
    path += ' Z';
    return path;
  };

  const svgWidth = finalLength + depthOffset + 10;
  const svgHeight = finalHeight + heightOffset + shadowOffset + 10;

  // Determine package shape category for better visual styling
  const getPackageType = () => {
    const isFlat = height < Math.min(length, width) * 0.3;
    const isTall = height > Math.max(length, width) * 1.5;
    const isSquare = Math.abs(length - width) < Math.max(length, width) * 0.2;
    
    if (isFlat) return 'flat';
    if (isTall) return 'tall';
    if (isSquare) return 'square';
    return 'rectangular';
  };

  const packageType = getPackageType();

  // Enhanced gradients with better depth perception
  const getGradients = () => {
    switch (packageType) {
      case 'flat':
        return {
          front: { start: '#fff8e1', middle: '#ffeb3b', end: '#ff8f00' },
          right: { start: '#ff8f00', middle: '#f57c00', end: '#e65100' },
          top: { start: '#fff9c4', middle: '#ffeb3b', end: '#ffa000' },
          stroke: '#e65100',
          shadow: '#bf360c'
        };
      case 'tall':
        return {
          front: { start: '#e8f5e8', middle: '#66bb6a', end: '#2e7d32' },
          right: { start: '#2e7d32', middle: '#1b5e20', end: '#0d3818' },
          top: { start: '#f1f8e9', middle: '#8bc34a', end: '#689f38' },
          stroke: '#1b5e20',
          shadow: '#0d3818'
        };
      case 'square':
        return {
          front: { start: '#fce4ec', middle: '#e91e63', end: '#ad1457' },
          right: { start: '#ad1457', middle: '#880e4f', end: '#4a0e4e' },
          top: { start: '#f8bbd9', middle: '#e91e63', end: '#c2185b' },
          stroke: '#880e4f',
          shadow: '#4a0e4e'
        };
      default:
        return {
          front: { start: '#e3f2fd', middle: '#42a5f5', end: '#1565c0' },
          right: { start: '#1565c0', middle: '#0d47a1', end: '#002171' },
          top: { start: '#f3e5f5', middle: '#ba68c8', end: '#7b1fa2' },
          stroke: '#0d47a1',
          shadow: '#002171'
        };
    }
  };

  const colors = getGradients();

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <motion.div
        initial={{ scale: 0, rotateY: -20 }}
        animate={{ scale: 1, rotateY: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative filter drop-shadow-xl"
      >
        <svg
          width={svgWidth}
          height={svgHeight}
          viewBox={`-5 ${-heightOffset - 5} ${svgWidth} ${svgHeight + shadowOffset}`}
          className="hover:drop-shadow-2xl transition-all duration-300"
          style={{ shapeRendering: 'geometricPrecision' }}
        >
          <defs>
            {/* Enhanced gradients with multiple stops for smoother transitions */}
            <linearGradient id={`frontGradient-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.front.start} />
              <stop offset="50%" stopColor={colors.front.middle} />
              <stop offset="100%" stopColor={colors.front.end} />
            </linearGradient>
            
            <linearGradient id={`rightGradient-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.right.start} />
              <stop offset="50%" stopColor={colors.right.middle} />
              <stop offset="100%" stopColor={colors.right.end} />
            </linearGradient>
            
            <linearGradient id={`topGradient-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.top.start} />
              <stop offset="50%" stopColor={colors.top.middle} />
              <stop offset="100%" stopColor={colors.top.end} />
            </linearGradient>
            
            {/* Realistic shadow gradient */}
            <linearGradient id={`shadowGradient-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(0,0,0,0.25)" />
              <stop offset="50%" stopColor="rgba(0,0,0,0.15)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.05)" />
            </linearGradient>
            
            {/* Shadow filters for depth */}
            <filter id={`shadow-${size}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
              <feOffset dx="2" dy="2" result="offset" />
              <feFlood floodColor={colors.shadow} floodOpacity="0.3"/>
              <feComposite in2="offset" operator="in" />
              <feMerge> 
                <feMergeNode />
                <feMergeNode in="SourceGraphic" /> 
              </feMerge>
            </filter>
            
            {/* Shadow blur filter */}
            <filter id={`shadowBlur-${size}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2"/>
            </filter>
          </defs>
          
          {/* Realistic parallelogram shadow */}
          <motion.path
            d={createPath(shadowPoints, 2)}
            fill={`url(#shadowGradient-${size})`}
            filter={`url(#shadowBlur-${size})`}
            opacity={shadowOpacity}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: shadowOpacity, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          />
          
          {/* Front face with precise alignment */}
          <motion.path
            d={createPath(frontFace, 4)}
            fill={`url(#frontGradient-${size})`}
            stroke={colors.stroke}
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            filter={`url(#shadow-${size})`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          />
          
          {/* Right face with enhanced depth */}
          <motion.path
            d={createPath(rightFace, 4)}
            fill={`url(#rightGradient-${size})`}
            stroke={colors.stroke}
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          />
          
          {/* Top face with enhanced perspective */}
          <motion.path
            d={createPath(topFace, 4)}
            fill={`url(#topGradient-${size})`}
            stroke={colors.stroke}
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          />
          
          {/* Edge highlights for enhanced 3D effect - perfectly aligned */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          >
            {/* Top edges */}
            <line x1={0} y1={0} x2={finalLength} y2={0} />
            <line x1={finalLength} y1={0} x2={finalLength + depthOffset} y2={-heightOffset} />
            <line x1={0} y1={0} x2={depthOffset} y2={-heightOffset} />
            
            {/* Vertical edges */}
            <line x1={0} y1={0} x2={0} y2={finalHeight} />
            <line x1={finalLength} y1={0} x2={finalLength} y2={finalHeight} />
            <line x1={finalLength + depthOffset} y1={-heightOffset} x2={finalLength + depthOffset} y2={finalHeight - heightOffset} />
          </motion.g>
          
          {/* Package icon in center - scaled based on package size */}
          <foreignObject
            x={Math.max(finalLength * 0.4, 10)}
            y={Math.max(finalHeight * 0.4, 10)}
            width={config.iconSize}
            height={config.iconSize}
          >
            <Package 
              className="text-white drop-shadow-md" 
              size={config.iconSize} 
            />
          </foreignObject>
          
          {/* Enhanced dimension labels - only show if showDimensions is true */}
          {showDimensions && (
            <>
              <text
                x={finalLength / 2}
                y={finalHeight + 15}
                textAnchor="middle"
                className="fill-gray-700 text-xs font-bold drop-shadow-sm"
                style={{ filter: 'drop-shadow(0 1px 1px rgba(255,255,255,0.8))' }}
              >
                {length}cm
              </text>
              
              <text
                x={finalLength + depthOffset / 2}
                y={finalHeight - heightOffset / 2 + 5}
                textAnchor="middle"
                className="fill-gray-700 text-xs font-bold drop-shadow-sm"
                style={{ filter: 'drop-shadow(0 1px 1px rgba(255,255,255,0.8))' }}
                transform={`rotate(-25 ${finalLength + depthOffset / 2} ${finalHeight - heightOffset / 2 + 5})`}
              >
                {width}cm
              </text>
              
              <text
                x={-15}
                y={finalHeight / 2}
                textAnchor="middle"
                className="fill-gray-700 text-xs font-bold drop-shadow-sm"
                style={{ filter: 'drop-shadow(0 1px 1px rgba(255,255,255,0.8))' }}
                transform={`rotate(-90 -15 ${finalHeight / 2})`}
              >
                {height}cm
              </text>
            </>
          )}
        </svg>
      </motion.div>
      
      {showDimensions && (
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className={`font-mono font-bold text-gray-700 mb-1 ${config.textSize}`}>
            {length} × {width} × {height} cm
          </div>
          {weight && (
            <div className={`text-gray-600 font-semibold ${config.textSize}`}>
              📦 {weight}
            </div>
          )}
          <div className="text-xs text-gray-500 mt-1">
            Volume: {((length * width * height) / 1000).toFixed(1)}L
          </div>
          <div className="text-xs text-gray-400 mt-1 capitalize">
            {packageType} package
          </div>
        </motion.div>
      )}
    </div>
  );
}