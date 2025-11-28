export const useAvatarStore = defineStore('avatar', {
  state: () => ({
    hair: 0,
    faceHair: 0,
    eyes: 0,
    bodyColor: 0,
    backgroundColor: 0,
  }),
  getters: {
    getHair: (state) => state.hair,
    getFaceHair: (state) => state.faceHair,
    getEyes: (state) => state.eyes,
    getBodyColor: (state) => state.bodyColor,
    getBackgroundColor: (state) => state.backgroundColor,
  },
  actions: {
    setInitialValues(avatarConfig: any) {
      this.hair = avatarConfig.hair || 0
      this.faceHair = avatarConfig.faceHair || 0
      this.eyes = avatarConfig.eyes || 0
      this.bodyColor = avatarConfig.bodyColor || 0
      this.backgroundColor = avatarConfig.backgroundColor || 0
    },
    setHair(hair: number) {
      this.hair = hair // `this` is properly typed here
    },
    setFaceHair(faceHair: number) {
      this.faceHair = faceHair
    },
    setEyes(eyes: number) {
      this.eyes = eyes
    },
    setBodyColor(bodyColor: number) {
      this.bodyColor = bodyColor
    },
    setBackgroundColor(backgroundColor: number) {
      this.backgroundColor = backgroundColor
    },
  },
})
