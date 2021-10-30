const CONTRACT_ADDRESS = "0xa23cD6C3285E0f49Bea28F083a2D03875b4ad106";
function transformPlayerData(playerData, isBoss) {
  if (isBoss) {
    return {
      name: playerData.name,
      imageURI: playerData.imageURI,
      hp: playerData.hp.toNumber(),
      maxHp: playerData.maxHp.toNumber(),
      attackDamage: playerData.attackDamage.toNumber(),
    };
  }

  return {
    name: playerData.name,
    imageURI: playerData.imageURI,
    sp: playerData.sp.toNumber(),
    maxSp: playerData.maxSp.toNumber(),
    shotAccuracy: playerData.shotAccuracy.toNumber(),
  };
}

export { CONTRACT_ADDRESS, transformPlayerData };
