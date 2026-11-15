const A = ["清", "云", "禅", "静", "松", "竹", "月", "鹤", "玄", "虚", "远", "淡", "岚", "栖", "听", "问"];
const B = ["风", "谷", "溪", "峰", "烟", "心", "尘", "舟", "灯", "石", "霜", "露", "雨", "泉", "山", "云"];
export function poeticName() {
  return A[(Math.random() * A.length) | 0] + B[(Math.random() * B.length) | 0];
}
