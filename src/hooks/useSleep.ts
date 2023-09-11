export default async function (time: number) {
  return new Promise(resolve => {
    setTimeout(resolve, time)
  })
}