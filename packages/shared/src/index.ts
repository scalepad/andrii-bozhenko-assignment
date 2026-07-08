export type Role = 'BUYER' | 'SELLER';

export enum ShoeSize {
  US_5 = '5',
  US_5_5 = '5.5',
  US_6 = '6',
  US_6_5 = '6.5',
  US_7 = '7',
  US_7_5 = '7.5',
  US_8 = '8',
  US_8_5 = '8.5',
  US_9 = '9',
  US_9_5 = '9.5',
  US_10 = '10',
  US_10_5 = '10.5',
  US_11 = '11',
  US_11_5 = '11.5',
  US_12 = '12',
  US_13 = '13',
  US_14 = '14'
}

export enum ShoeColor {
  BLACK = 'Black',
  WHITE = 'White',
  GREY = 'Grey',
  BROWN = 'Brown',
  RED = 'Red',
  ORANGE = 'Orange',
  YELLOW = 'Yellow',
  GREEN = 'Green',
  BLUE = 'Blue',
  PURPLE = 'Purple',
  PINK = 'Pink',
  MULTICOLOR = 'Multicolor'
}

export enum ShoeStyle {
  SNEAKER = 'Sneaker',
  RUNNER = 'Runner',
  HIGH_TOP = 'High Top',
  LOW_TOP = 'Low Top',
  BOOT = 'Boot',
  LOAFER = 'Loafer',
  SANDAL = 'Sandal'
}

export enum UpperMaterial {
  CANVAS = 'Canvas',
  LEATHER = 'Leather',
  SUEDE = 'Suede',
  MESH = 'Mesh',
  KNIT = 'Knit',
  SYNTHETIC = 'Synthetic',
  RECYCLED = 'Recycled'
}

export enum StandardAttributeKey {
  SIZE = 'SIZE',
  COLOR = 'COLOR',
  STYLE = 'STYLE',
  UPPER_MATERIAL = 'UPPER_MATERIAL'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
}
export interface ListingImage {
  id?: string;
  url: string;
}
interface AttributeBase {
  id?: string;
}
export type StandardAttribute = AttributeBase &
  (
    | { kind: 'STANDARD'; key: StandardAttributeKey.SIZE; value: ShoeSize }
    | { kind: 'STANDARD'; key: StandardAttributeKey.COLOR; value: ShoeColor }
    | { kind: 'STANDARD'; key: StandardAttributeKey.STYLE; value: ShoeStyle }
    | {
        kind: 'STANDARD';
        key: StandardAttributeKey.UPPER_MATERIAL;
        value: UpperMaterial;
      }
  );
export interface CustomAttribute extends AttributeBase {
  kind: 'CUSTOM';
  key: string;
  value: string;
}
export type ListingAttribute = StandardAttribute | CustomAttribute;
export interface Listing {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  priceCents: number;
  createdAt: string;
  updatedAt: string;
  seller?: Pick<User, 'id' | 'name'>;
  images: ListingImage[];
  attributes: ListingAttribute[];
}
export interface ListingInput {
  title: string;
  description: string;
  priceCents: number;
  images: string[];
  attributes: ListingAttribute[];
}
export interface CartItem {
  id: string;
  quantity: number;
  listing: Listing;
}
export interface Cart {
  items: CartItem[];
  totalCents: number;
}
export interface OrderItem {
  id: string;
  title: string;
  priceCents: number;
  quantity: number;
  imageUrl?: string | null;
}
export interface Order {
  id: string;
  totalCents: number;
  status: 'COMPLETED';
  createdAt: string;
  items: OrderItem[];
}
export interface ApiError {
  error: { code: string; message: string; fields?: Record<string, string[]> };
}
