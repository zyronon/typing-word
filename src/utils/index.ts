export function getRandom(a: number, b: number): number {
  return Math.random() * (b - a) + a;
}

export function no(){
  ElMessage.warning('未现实')
}