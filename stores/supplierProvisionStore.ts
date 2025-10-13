
export const useSupplierProvisionStore = defineStore('supplierProvision', () => {

    const concepts = ref<any>([])

    const addConcept = (concept: any) => {
        concepts.value.push(concept)
    }

    const removeConcept = (concept: any) => {
        const index = concepts.value.indexOf(concept)
        concepts.value.splice(index, 1)
    }

    const getConcepts = () => {
        return concepts.value
    }

    const clearConcepts = () => {
        concepts.value = []
    }

    return {
        concepts,
        addConcept,
        removeConcept,
        getConcepts,
        clearConcepts
    }
})
