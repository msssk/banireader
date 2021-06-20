declare module "conversions" {
    export function gam_sRGB(RGB: any): any;
    export function Lab_to_LCH(Lab: any): any[];
}
declare function multiplyMatrices(A: any, B: any): any;
declare module "utilities" {
    export function sRGB_to_LCH(RGB: [number, number, number]): [number, number, number];
    export function LCH_to_sRGB(LCH: [number, number, number]): [number, number, number];
}
