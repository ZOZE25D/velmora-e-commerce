export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  details: string[];
  images: string[];
  sizes: string[];
  colors?: { name: string; hex: string }[];
  stock?: number;
}

export const products: Product[] = [
  // WOMEN (10 Products)
  {
    id: 'w1',
    name: 'Silk Evening Dress',
    price: 14500,
    category: 'women',
    image: 'https://images.unsplash.com/photo-1539008835657-9e8e96800057?auto=format&fit=crop&q=80&w=800',
    description: 'A stunning floor-length evening dress crafted from the finest Italian silk. Featuring a delicate cowl neckline and an elegant open back.',
    details: ['100% Italian Silk', 'Hand-finished seams', 'Hidden side zipper', 'Dry clean only'],
    images: [
      'https://images.unsplash.com/photo-1539008835657-9e8e96800057?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&q=80&w=800'
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Midnight Black', hex: '#000000' },
      { name: 'Royal Emerald', hex: '#043927' },
      { name: 'Ruby Red', hex: '#9b111e' },
      { name: 'Deep Sapphire', hex: '#082567' },
      { name: 'Champagne', hex: '#fad6a5' }
    ]
  },
  {
    id: 'w2',
    name: 'Cashmere Oversized Sweater',
    price: 8900,
    category: 'women',
    image: 'https://images.unsplash.com/photo-1574201635302-388dd92a4c3f?auto=format&fit=crop&q=80&w=800',
    description: 'Luxuriously soft cashmere sweater with a relaxed, oversized fit. Perfect for elegant layering.',
    details: ['100% Mongolian Cashmere', 'Ribbed cuffs', 'Sustainable sourcing'],
    images: [
      'https://images.unsplash.com/photo-1574201635302-388dd92a4c3f?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800'
    ],
    sizes: ['S', 'M', 'L'],
    colors: [
      { name: 'Oatmeal', hex: '#dfd7ca' },
      { name: 'Charcoal', hex: '#36454f' },
      { name: 'Dusty Rose', hex: '#c08081' },
      { name: 'Sage Green', hex: '#9dc183' },
      { name: 'Cream', hex: '#fffdd0' }
    ]
  },
  {
    id: 'w3',
    name: 'Tailored Wool Blazer',
    price: 11200,
    category: 'women',
    image: 'https://images.unsplash.com/photo-1548624313-0396c75e4b1a?auto=format&fit=crop&q=80&w=800',
    description: 'A sharp, tailored blazer made from premium virgin wool. Features structured shoulders.',
    details: ['Virgin Wool Blend', 'Silk lining', 'Internal pocket'],
    images: [
      'https://images.unsplash.com/photo-1548624313-0396c75e4b1a?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1539109132381-31a1c974573f?auto=format&fit=crop&q=80&w=800'
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [
      { name: 'Classic Navy', hex: '#000080' },
      { name: 'Black', hex: '#000000' },
      { name: 'Camel', hex: '#c19a6b' },
      { name: 'Pinstripe Grey', hex: '#708090' }
    ]
  },
  {
    id: 'w4',
    name: 'Pleated Midi Skirt',
    price: 5800,
    category: 'women',
    image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=800',
    description: 'Elegant pleated midi skirt with a subtle shimmer. Features a comfortable elasticated waistband.',
    details: ['Satin Finish', 'Pleated design', 'Midi length'],
    images: [
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1551163943-3f6a855d1153?auto=format&fit=crop&q=80&w=800'
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [
      { name: 'Emerald', hex: '#50c878' },
      { name: 'Copper', hex: '#b87333' },
      { name: 'Silver', hex: '#c0c0c0' },
      { name: 'Midnight Blue', hex: '#191970' },
      { name: 'Blush', hex: '#de5d83' }
    ]
  },
  {
    id: 'w5',
    name: 'Lace Panel Blouse',
    price: 4200,
    category: 'women',
    image: 'https://images.unsplash.com/photo-1551163943-3f6a855d1153?auto=format&fit=crop&q=80&w=800',
    description: 'Delicate lace panel blouse with a high neck and ruffled sleeves. Perfect for formal events.',
    details: ['Cotton Lace', 'Button back', 'Sheer panels'],
    images: [
      'https://images.unsplash.com/photo-1551163943-3f6a855d1153?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&q=80&w=800'
    ],
    sizes: ['S', 'M', 'L'],
    colors: [
      { name: 'Ivory', hex: '#fffff0' },
      { name: 'Soft Black', hex: '#1a1a1a' },
      { name: 'Powder Blue', hex: '#b0e0e6' },
      { name: 'Lavender', hex: '#e6e6fa' }
    ]
  },
  {
    id: 'w6',
    name: 'High-Waist Leather Trousers',
    price: 12500,
    category: 'women',
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&q=80&w=800',
    description: 'Buttery soft lambskin leather trousers with a flattering high-waist cut.',
    details: ['100% Lambskin', 'Straight leg', 'Side pockets'],
    images: [
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1539008835657-9e8e96800057?auto=format&fit=crop&q=80&w=800'
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [
      { name: 'Black', hex: '#000000' },
      { name: 'Burgundy', hex: '#800020' },
      { name: 'Forest Green', hex: '#014421' },
      { name: 'Tan', hex: '#d2b48c' }
    ]
  },
  {
    id: 'w7',
    name: 'Velvet Wrap Gown',
    price: 16800,
    category: 'women',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800',
    description: 'Luxurious velvet wrap gown with a deep V-neck and thigh-high slit.',
    details: ['Silk Velvet', 'Wrap closure', 'Floor length'],
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1539008835657-9e8e96800057?auto=format&fit=crop&q=80&w=800'
    ],
    sizes: ['S', 'M', 'L'],
    colors: [
      { name: 'Burgundy', hex: '#800020' },
      { name: 'Emerald', hex: '#043927' },
      { name: 'Midnight Blue', hex: '#191970' },
      { name: 'Deep Violet', hex: '#2e0854' },
      { name: 'Black Velvet', hex: '#0a0a0a' }
    ]
  },
  {
    id: 'w8',
    name: 'Embroidered Kaftan',
    price: 7500,
    category: 'women',
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&q=80&w=800',
    description: 'Beautifully embroidered kaftan made from lightweight linen. Ideal for resort wear.',
    details: ['100% Linen', 'Hand embroidery', 'Relaxed fit'],
    images: [
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1539008835657-9e8e96800057?auto=format&fit=crop&q=80&w=800'
    ],
    sizes: ['One Size'],
    colors: [
      { name: 'White/Gold', hex: '#ffffff' },
      { name: 'Turquoise/Silver', hex: '#40e0d0' },
      { name: 'Coral/Gold', hex: '#ff7f50' },
      { name: 'Navy/White', hex: '#000080' }
    ]
  },
  {
    id: 'w9',
    name: 'Satin Slip Skirt',
    price: 3900,
    category: 'women',
    image: 'https://images.unsplash.com/photo-1609505848912-b7c3b8b4beda?auto=format&fit=crop&q=80&w=800',
    description: 'Versatile satin slip skirt with a bias cut for a beautiful drape.',
    details: ['Heavyweight Satin', 'Elastic waist', 'Midi length'],
    images: [
      'https://images.unsplash.com/photo-1609505848912-b7c3b8b4beda?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=800'
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [
      { name: 'Champagne', hex: '#fad6a5' },
      { name: 'Pearl', hex: '#fcfcfc' },
      { name: 'Sage', hex: '#9dc183' },
      { name: 'Rose Gold', hex: '#b76e79' },
      { name: 'Black', hex: '#000000' }
    ]
  },
  {
    id: 'w10',
    name: 'Tweed Jacket',
    price: 13200,
    category: 'women',
    image: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=800',
    description: 'Classic tweed jacket with metallic thread accents and fringe detailing.',
    details: ['Wool Tweed', 'Silk lining', 'Gold buttons'],
    images: [
      'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1548624313-0396c75e4b1a?auto=format&fit=crop&q=80&w=800'
    ],
    sizes: ['S', 'M', 'L'],
    colors: [
      { name: 'Black/White', hex: '#333333' },
      { name: 'Pink/Cream', hex: '#f8d7da' },
      { name: 'Navy/Gold', hex: '#000080' },
      { name: 'Sky Blue', hex: '#87ceeb' }
    ]
  },

  // MEN (10 Products)
  {
    id: 'm1',
    name: 'Merino Wool Suit',
    price: 28500,
    category: 'men',
    image: 'https://images.unsplash.com/photo-1594932224828-b4b059b6f6ee?auto=format&fit=crop&q=80&w=800',
    description: 'A sophisticated two-piece suit crafted from ultra-fine Merino wool.',
    details: ['100% Merino Wool', 'Slim fit', 'Double-vented jacket'],
    images: ['https://images.unsplash.com/photo-1594932224828-b4b059b6f6ee?auto=format&fit=crop&q=80&w=800'],
    sizes: ['48', '50', '52', '54'],
    colors: [
      { name: 'Charcoal', hex: '#36454f' },
      { name: 'Navy Blue', hex: '#000080' },
      { name: 'Jet Black', hex: '#050505' },
      { name: 'Light Grey', hex: '#d3d3d3' }
    ]
  },
  {
    id: 'm2',
    name: 'Egyptian Cotton Shirt',
    price: 3200,
    category: 'men',
    image: 'https://images.unsplash.com/photo-1598033129183-c4f50c7176c8?auto=format&fit=crop&q=80&w=800',
    description: 'Crisp, breathable shirt made from the world\'s finest Egyptian cotton.',
    details: ['100% Egyptian Cotton', 'Mother of pearl buttons', 'Easy-iron finish'],
    images: ['https://images.unsplash.com/photo-1598033129183-c4f50c7176c8?auto=format&fit=crop&q=80&w=800'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Pure White', hex: '#ffffff' },
      { name: 'Sky Blue', hex: '#87ceeb' },
      { name: 'Soft Pink', hex: '#ffb6c1' },
      { name: 'Lavender', hex: '#e6e6fa' },
      { name: 'Mint', hex: '#98ff98' }
    ]
  },
  {
    id: 'm3',
    name: 'Leather Bomber Jacket',
    price: 19500,
    category: 'men',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=800',
    description: 'Premium lambskin leather jacket with a classic bomber silhouette.',
    details: ['Genuine Lambskin', 'Quilted lining', 'Heavy-duty zippers'],
    images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=800'],
    sizes: ['M', 'L', 'XL'],
    colors: [
      { name: 'Antique Brown', hex: '#5d4037' },
      { name: 'Black', hex: '#000000' },
      { name: 'Cognac', hex: '#9a463d' },
      { name: 'Midnight Blue', hex: '#191970' }
    ]
  },
  {
    id: 'm4',
    name: 'Classic Trench Coat',
    price: 15800,
    category: 'men',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800',
    description: 'A timeless double-breasted trench coat in water-repellent cotton gabardine.',
    details: ['Cotton Gabardine', 'Belted waist', 'Shoulder epaulettes'],
    images: ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Beige', hex: '#f5f5dc' },
      { name: 'Navy', hex: '#000080' },
      { name: 'Black', hex: '#000000' },
      { name: 'Olive', hex: '#556b2f' }
    ]
  },
  {
    id: 'm5',
    name: 'Cashmere V-Neck Sweater',
    price: 9200,
    category: 'men',
    image: 'https://images.unsplash.com/photo-1610384029674-7333e5b93091?auto=format&fit=crop&q=80&w=800',
    description: 'Ultra-soft V-neck sweater made from 100% pure cashmere.',
    details: ['100% Cashmere', 'Classic fit', 'Hand wash only'],
    images: ['https://images.unsplash.com/photo-1610384029674-7333e5b93091?auto=format&fit=crop&q=80&w=800'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Navy', hex: '#000080' },
      { name: 'Burgundy', hex: '#800020' },
      { name: 'Forest Green', hex: '#014421' },
      { name: 'Camel', hex: '#c19a6b' },
      { name: 'Heather Grey', hex: '#9a9a9a' }
    ]
  },
  {
    id: 'm6',
    name: 'Tailored Chinos',
    price: 4500,
    category: 'men',
    image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&q=80&w=800',
    description: 'Premium cotton chinos with a hint of stretch for ultimate comfort.',
    details: ['98% Cotton, 2% Elastane', 'Slim-straight fit', 'Button fly'],
    images: ['https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&q=80&w=800'],
    sizes: ['30', '32', '34', '36'],
    colors: [
      { name: 'Khaki', hex: '#c3b091' },
      { name: 'Navy', hex: '#000080' },
      { name: 'Olive', hex: '#556b2f' },
      { name: 'Stone', hex: '#877f6c' },
      { name: 'Black', hex: '#000000' }
    ]
  },
  {
    id: 'm7',
    name: 'Silk Tie',
    price: 1800,
    category: 'men',
    image: 'https://images.unsplash.com/photo-1589756823851-ede1be674188?auto=format&fit=crop&q=80&w=800',
    description: 'Hand-finished silk tie with a subtle jacquard pattern.',
    details: ['100% Silk', 'Handmade in Italy', 'Standard width'],
    images: ['https://images.unsplash.com/photo-1589756823851-ede1be674188?auto=format&fit=crop&q=80&w=800'],
    sizes: ['One Size'],
    colors: [
      { name: 'Burgundy', hex: '#800020' },
      { name: 'Royal Blue', hex: '#4169e1' },
      { name: 'Silver', hex: '#c0c0c0' },
      { name: 'Emerald', hex: '#50c878' },
      { name: 'Gold', hex: '#ffd700' }
    ]
  },
  {
    id: 'm8',
    name: 'Linen Summer Blazer',
    price: 12500,
    category: 'men',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800',
    description: 'Unstructured blazer made from breathable Italian linen.',
    details: ['100% Linen', 'Patch pockets', 'Half-lined'],
    images: ['https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800'],
    sizes: ['48', '50', '52', '54'],
    colors: [
      { name: 'Sand', hex: '#c2b280' },
      { name: 'Light Blue', hex: '#add8e6' },
      { name: 'White', hex: '#ffffff' },
      { name: 'Sage', hex: '#9dc183' }
    ]
  },
  {
    id: 'm9',
    name: 'Oxford Button-Down',
    price: 2800,
    category: 'men',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=800',
    description: 'Classic Oxford shirt with a button-down collar and chest pocket.',
    details: ['Heavyweight Cotton', 'Garment washed', 'Regular fit'],
    images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=800'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Light Blue', hex: '#add8e6' },
      { name: 'White', hex: '#ffffff' },
      { name: 'Pink', hex: '#ffc0cb' },
      { name: 'Yellow', hex: '#ffffed' },
      { name: 'Grey', hex: '#808080' }
    ]
  },
  {
    id: 'm10',
    name: 'Wool Overcoat',
    price: 22000,
    category: 'men',
    image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&q=80&w=800',
    description: 'Heavyweight wool overcoat with a structured silhouette and peak lapels.',
    details: ['80% Wool, 20% Polyamide', 'Fully lined', 'Internal chest pockets'],
    images: ['https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&q=80&w=800'],
    sizes: ['48', '50', '52', '54'],
    colors: [
      { name: 'Camel', hex: '#c19a6b' },
      { name: 'Navy', hex: '#000080' },
      { name: 'Charcoal', hex: '#36454f' },
      { name: 'Black', hex: '#000000' }
    ]
  },

  // SHOES (10 Products)
  {
    id: 's1',
    name: 'Handcrafted Leather Loafers',
    price: 6500,
    category: 'shoes',
    image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&q=80&w=800',
    description: 'Classic loafers made from premium full-grain leather.',
    details: ['Full-grain Leather', 'Blake stitched sole', 'Hand-painted finish'],
    images: ['https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&q=80&w=800'],
    sizes: ['40', '41', '42', '43', '44', '45'],
    colors: [
      { name: 'Cognac', hex: '#9a463d' },
      { name: 'Black', hex: '#000000' },
      { name: 'Dark Brown', hex: '#3d2b1f' },
      { name: 'Burgundy', hex: '#800020' }
    ]
  },
  {
    id: 's2',
    name: 'Suede Chelsea Boots',
    price: 7800,
    category: 'shoes',
    image: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&q=80&w=800',
    description: 'Elegant Chelsea boots in soft Italian suede.',
    details: ['Italian Suede', 'Leather lining', 'Durable rubber sole'],
    images: ['https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&q=80&w=800'],
    sizes: ['41', '42', '43', '44'],
    colors: [
      { name: 'Sand', hex: '#c2b280' },
      { name: 'Chocolate', hex: '#2b1700' },
      { name: 'Grey', hex: '#808080' },
      { name: 'Black', hex: '#000000' }
    ]
  },
  {
    id: 's3',
    name: 'Minimalist White Sneakers',
    price: 4800,
    category: 'shoes',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=800',
    description: 'Clean, minimalist sneakers made from premium calfskin leather.',
    details: ['Calfskin Leather', 'Margom rubber sole', 'Cotton laces'],
    images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=800'],
    sizes: ['39', '40', '41', '42', '43', '44', '45'],
    colors: [
      { name: 'White', hex: '#ffffff' },
      { name: 'Off-White', hex: '#f5f5f5' },
      { name: 'Light Grey', hex: '#d3d3d3' },
      { name: 'Black/White', hex: '#1a1a1a' }
    ]
  },
  {
    id: 's4',
    name: 'Patent Leather Pumps',
    price: 5900,
    category: 'shoes',
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=800',
    description: 'Classic pointed-toe pumps in high-shine patent leather.',
    details: ['Patent Leather', '100mm heel', 'Leather sole'],
    images: ['https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=800'],
    sizes: ['36', '37', '38', '39', '40'],
    colors: [
      { name: 'Nude', hex: '#e3bc9a' },
      { name: 'Black', hex: '#000000' },
      { name: 'Red', hex: '#ff0000' },
      { name: 'Navy', hex: '#000080' },
      { name: 'Silver', hex: '#c0c0c0' }
    ]
  },
  {
    id: 's5',
    name: 'Velvet Slippers',
    price: 3500,
    category: 'shoes',
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=800',
    description: 'Luxurious velvet slippers with quilted lining and leather sole.',
    details: ['Cotton Velvet', 'Quilted silk lining', 'Embroidered crest'],
    images: ['https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=800'],
    sizes: ['40', '41', '42', '43', '44'],
    colors: [
      { name: 'Navy', hex: '#000080' },
      { name: 'Burgundy', hex: '#800020' },
      { name: 'Emerald', hex: '#043927' },
      { name: 'Black', hex: '#000000' }
    ]
  },
  {
    id: 's6',
    name: 'Monk Strap Shoes',
    price: 7200,
    category: 'shoes',
    image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&q=80&w=800',
    description: 'Double monk strap shoes in polished calf leather.',
    details: ['Calf Leather', 'Silver buckles', 'Goodyear welted'],
    images: ['https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&q=80&w=800'],
    sizes: ['41', '42', '43', '44', '45'],
    colors: [
      { name: 'Dark Brown', hex: '#3d2b1f' },
      { name: 'Black', hex: '#000000' },
      { name: 'Tan', hex: '#d2b48c' },
      { name: 'Oxblood', hex: '#4a0e0e' }
    ]
  },
  {
    id: 's7',
    name: 'Strappy Heeled Sandals',
    price: 5200,
    category: 'shoes',
    image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&q=80&w=800',
    description: 'Elegant strappy sandals with a manageable block heel.',
    details: ['Metallic Leather', '80mm heel', 'Buckle closure'],
    images: ['https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&q=80&w=800'],
    sizes: ['36', '37', '38', '39', '40'],
    colors: [
      { name: 'Silver', hex: '#c0c0c0' },
      { name: 'Gold', hex: '#ffd700' },
      { name: 'Rose Gold', hex: '#b76e79' },
      { name: 'Black', hex: '#000000' }
    ]
  },
  {
    id: 's8',
    name: 'Espadrille Wedges',
    price: 3200,
    category: 'shoes',
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=800',
    description: 'Summer-ready espadrille wedges with canvas upper and jute sole.',
    details: ['Canvas Upper', 'Jute sole', 'Ankle strap'],
    images: ['https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=800'],
    sizes: ['36', '37', '38', '39', '40'],
    colors: [
      { name: 'Black', hex: '#000000' },
      { name: 'Navy', hex: '#000080' },
      { name: 'Cream', hex: '#fffdd0' },
      { name: 'Red', hex: '#ff0000' }
    ]
  },
  {
    id: 's9',
    name: 'Desert Boots',
    price: 4500,
    category: 'shoes',
    image: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&q=80&w=800',
    description: 'Classic desert boots in soft suede with a crepe sole.',
    details: ['Suede Upper', 'Crepe sole', 'Two-eyelet lacing'],
    images: ['https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&q=80&w=800'],
    sizes: ['41', '42', '43', '44', '45'],
    colors: [
      { name: 'Tan', hex: '#d2b48c' },
      { name: 'Grey', hex: '#808080' },
      { name: 'Navy', hex: '#000080' },
      { name: 'Chocolate', hex: '#2b1700' }
    ]
  },
  {
    id: 's10',
    name: 'Running Trainers',
    price: 3800,
    category: 'shoes',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800',
    description: 'High-performance running trainers with responsive cushioning.',
    details: ['Mesh Upper', 'Foam midsole', 'Rubber outsole'],
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800'],
    sizes: ['38', '39', '40', '41', '42', '43', '44'],
    colors: [
      { name: 'Red/Black', hex: '#ff0000' },
      { name: 'Blue/White', hex: '#0000ff' },
      { name: 'All Black', hex: '#000000' },
      { name: 'Grey/Neon', hex: '#39ff14' }
    ]
  },

  // ACCESSORIES (10 Products)
  {
    id: 'a1',
    name: 'Minimalist Gold Watch',
    price: 12500,
    category: 'accessories',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800',
    description: 'A timeless timepiece featuring a 18k gold-plated case.',
    details: ['Swiss Movement', 'Sapphire Crystal', 'Water resistant 5ATM'],
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800'],
    sizes: ['One Size'],
    colors: [
      { name: 'Gold/Black', hex: '#ffd700' },
      { name: 'Silver/White', hex: '#c0c0c0' },
      { name: 'Rose Gold', hex: '#b76e79' },
      { name: 'Gunmetal', hex: '#2a2a2a' }
    ]
  },
  {
    id: 'a2',
    name: 'Silk Patterned Scarf',
    price: 2800,
    category: 'accessories',
    image: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&q=80&w=800',
    description: 'Hand-printed silk scarf with an intricate geometric pattern.',
    details: ['100% Silk', 'Hand-rolled edges', '90cm x 90cm'],
    images: ['https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&q=80&w=800'],
    sizes: ['One Size'],
    colors: [
      { name: 'Multi-Blue', hex: '#0000ff' },
      { name: 'Multi-Red', hex: '#ff0000' },
      { name: 'Multi-Green', hex: '#00ff00' },
      { name: 'Monochrome', hex: '#333333' }
    ]
  },
  {
    id: 'a3',
    name: 'Leather Tote Bag',
    price: 8500,
    category: 'accessories',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800',
    description: 'Spacious tote bag made from premium pebble-grain leather.',
    details: ['Pebble-grain Leather', 'Internal zip pocket', 'Magnetic closure'],
    images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800'],
    sizes: ['One Size'],
    colors: [
      { name: 'Tan', hex: '#d2b48c' },
      { name: 'Black', hex: '#000000' },
      { name: 'Navy', hex: '#000080' },
      { name: 'Burgundy', hex: '#800020' },
      { name: 'Grey', hex: '#808080' }
    ]
  },
  {
    id: 'a4',
    name: 'Aviator Sunglasses',
    price: 4200,
    category: 'accessories',
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=800',
    description: 'Classic aviator sunglasses with polarized lenses and gold frames.',
    details: ['Polarized Lenses', 'UV400 Protection', 'Metal Frame'],
    images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=800'],
    sizes: ['One Size'],
    colors: [
      { name: 'Gold/Green', hex: '#ffd700' },
      { name: 'Silver/Grey', hex: '#c0c0c0' },
      { name: 'Black/Black', hex: '#000000' },
      { name: 'Rose Gold/Brown', hex: '#b76e79' }
    ]
  },
  {
    id: 'a5',
    name: 'Cashmere Scarf',
    price: 3500,
    category: 'accessories',
    image: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&q=80&w=800',
    description: 'Luxuriously soft cashmere scarf for ultimate warmth.',
    details: ['100% Cashmere', 'Fringe edges', '200cm x 70cm'],
    images: ['https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&q=80&w=800'],
    sizes: ['One Size'],
    colors: [
      { name: 'Grey', hex: '#808080' },
      { name: 'Camel', hex: '#c19a6b' },
      { name: 'Navy', hex: '#000080' },
      { name: 'Black', hex: '#000000' },
      { name: 'Ivory', hex: '#fffff0' }
    ]
  },
  {
    id: 'a6',
    name: 'Leather Wallet',
    price: 1500,
    category: 'accessories',
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=800',
    description: 'Slim bifold wallet made from smooth calfskin leather.',
    details: ['Calfskin Leather', '8 card slots', 'Bill compartment'],
    images: ['https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=800'],
    sizes: ['One Size'],
    colors: [
      { name: 'Black', hex: '#000000' },
      { name: 'Dark Brown', hex: '#3d2b1f' },
      { name: 'Navy', hex: '#000080' },
      { name: 'Tan', hex: '#d2b48c' }
    ]
  },
  {
    id: 'a7',
    name: 'Silver Cufflinks',
    price: 2200,
    category: 'accessories',
    image: 'https://images.unsplash.com/photo-1617114919297-3c8ddb01f599?auto=format&fit=crop&q=80&w=800',
    description: 'Sterling silver cufflinks with an engraved geometric design.',
    details: ['925 Sterling Silver', 'Hand polished', 'Toggle back'],
    images: ['https://images.unsplash.com/photo-1617114919297-3c8ddb01f599?auto=format&fit=crop&q=80&w=800'],
    sizes: ['One Size'],
    colors: [
      { name: 'Silver', hex: '#c0c0c0' },
      { name: 'Gold-Plated', hex: '#ffd700' },
      { name: 'Gunmetal', hex: '#2a2a2a' }
    ]
  },
  {
    id: 'a8',
    name: 'Wool Fedora',
    price: 3800,
    category: 'accessories',
    image: 'https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?auto=format&fit=crop&q=80&w=800',
    description: 'Structured wool fedora with a wide brim and grosgrain ribbon.',
    details: ['100% Wool Felt', 'Internal sweatband', 'Made in Spain'],
    images: ['https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?auto=format&fit=crop&q=80&w=800'],
    sizes: ['S', 'M', 'L'],
    colors: [
      { name: 'Black', hex: '#000000' },
      { name: 'Camel', hex: '#c19a6b' },
      { name: 'Navy', hex: '#000080' },
      { name: 'Grey', hex: '#808080' }
    ]
  },
  {
    id: 'a9',
    name: 'Leather Belt',
    price: 1200,
    category: 'accessories',
    image: 'https://images.unsplash.com/photo-1614165939092-44414e8d5e27?auto=format&fit=crop&q=80&w=800',
    description: 'Classic leather belt with a brushed silver buckle.',
    details: ['Full-grain Leather', 'Brushed silver buckle', '35mm width'],
    images: ['https://images.unsplash.com/photo-1614165939092-44414e8d5e27?auto=format&fit=crop&q=80&w=800'],
    sizes: ['32', '34', '36', '38'],
    colors: [
      { name: 'Dark Brown', hex: '#3d2b1f' },
      { name: 'Black', hex: '#000000' },
      { name: 'Tan', hex: '#d2b48c' },
      { name: 'Navy', hex: '#000080' }
    ]
  },
  {
    id: 'a10',
    name: 'Canvas Weekender Bag',
    price: 6500,
    category: 'accessories',
    image: 'https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&q=80&w=800',
    description: 'Durable canvas weekender bag with leather trim and brass hardware.',
    details: ['Heavyweight Canvas', 'Leather handles', 'Detachable shoulder strap'],
    images: ['https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&q=80&w=800'],
    sizes: ['One Size'],
    colors: [
      { name: 'Olive', hex: '#556b2f' },
      { name: 'Navy', hex: '#000080' },
      { name: 'Charcoal', hex: '#36454f' },
      { name: 'Khaki', hex: '#c3b091' }
    ]
  }
];
