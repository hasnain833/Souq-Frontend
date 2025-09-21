export const categoryOptions = [
  {
    id: 'women',
    name: "Women's clothing",
    subcategories: [
      {
        id: 'women-clothes',
        name: 'Clothes',
        items: [
          { id: 'women-dresses', name: 'Dresses' },
          { id: 'women-tops', name: 'Tops' },
          { id: 'women-pants', name: 'Pants' },
        ]
      },
      {
        id: 'women-shoes',
        name: 'Shoes',
        items: [
          { id: 'women-sneakers', name: 'Sneakers' },
          { id: 'women-boots', name: 'Boots' },
          { id: 'women-heels', name: 'Heels' },
        ]
      }
    ]
  },
  {
    id: 'men',
    name: "Men's clothing",
    subcategories: [
      {
        id: 'men-clothes',
        name: 'Clothes',
        items: [
          { id: 'men-shirts', name: 'Shirts' },
          { id: 'men-pants', name: 'Pants' },
          { id: 'men-jackets', name: 'Jackets' },
        ]
      },
      {
        id: 'men-shoes',
        name: 'Shoes',
        items: [
          { id: 'men-sneakers', name: 'Sneakers' },
          { id: 'men-boots', name: 'Boots' },
          { id: 'men-formal', name: 'Formal Shoes' },
        ]
      }
    ]
  }
];

export const attributeOptions = {
  brands: [
    { id: 'nike', name: 'Nike' },
    { id: 'adidas', name: 'Adidas' },
    { id: 'zara', name: 'Zara' },
    { id: 'hm', name: 'H&M' },
    { id: 'levis', name: "Levi's" },
    { id: 'other', name: 'Other' },
  ],
  sizes: {
    'women-dresses': [
      { id: '34', name: '34 / XS' },
      { id: '36', name: '36 / S' },
      { id: '38', name: '38 / M' },
      { id: '40', name: '40 / L' },
    ],
    'women-shoes': [
      { id: '36', name: '36' },
      { id: '37', name: '37' },
      { id: '38', name: '38' },
      { id: '39', name: '39' },
    ],
    default: [
      { id: 'xs', name: 'XS' },
      { id: 's', name: 'S' },
      { id: 'm', name: 'M' },
      { id: 'l', name: 'L' },
      { id: 'xl', name: 'XL' },
    ]
  },
  conditions: [
    { id: 'new', name: 'New with tags' },
    { id: 'like_new', name: 'Like new' },
    { id: 'good', name: 'Good' },
    { id: 'satisfactory', name: 'Satisfactory' },
  ],
  colors: [
    { id: 'black', name: 'Black' },
    { id: 'white', name: 'White' },
    { id: 'red', name: 'Red' },
    { id: 'blue', name: 'Blue' },
    { id: 'green', name: 'Green' },
    { id: 'yellow', name: 'Yellow' },
  ],
  materials: [
    { id: 'cotton', name: 'Cotton' },
    { id: 'polyester', name: 'Polyester' },
    { id: 'leather', name: 'Leather' },
    { id: 'wool', name: 'Wool' },
    { id: 'silk', name: 'Silk' },
    { id: 'linen', name: 'Linen' },
  ],
};