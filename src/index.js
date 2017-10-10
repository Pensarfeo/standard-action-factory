export const DEFATUL_FUNCTIONALITIES = [ 'create', 'update', 'load', 'delete' ]
export const DEFATUL_STATES = [ 'toRequest', 'request', 'requested', 'responded', 'succeeded', 'failed' ]

let store

function getTrace(resourceNode) {
    if (!resourceNode.name) return []
    return getTrace(resourceNode.parent).concat(resourceNode.name)
}

class StandardAction {
    constructor(resourceNode, functionality, state = null) {
        const resources = getTrace(resourceNode)
        this.meta = { resources, functionality, state }
        this.type = StandardAction.generateType(this.meta)
        this.__store__ = store
    }

    static getTrace(resourceNode) {
        if (!resourceNode.name) return []
        return StandardAction.getTrace(resourceNode.parent).concat(resourceNode.name)
    }

    static generateType({ resources, functionality, state }) {
        return resources
            .concat(functionality)
            .concat(state || [])
            .map(res => res.toUpperCase()).join('_')
    }

    dispatch(...args) {
        this.__store__.dispatch(this.creator(...args))
        return this
    }

    creator(payload, error = {}, meta = {}) {
        const newMeta = Object.assign({}, this.meta, meta)
        const { type } = this

        const action = {
            type, payload, error, meta: newMeta,
        }
        return action
    }
}

export { StandardAction }

let buildFunctionalityTree
let buildStateLeafs

const buildFunctionalityTreefromActionCreators = (resourceNode, actionCreators = []) => {
    Object.keys(actionCreators).forEach((name) => {
        resourceNode.self[ name ] = new StandardAction(resourceNode, name)
        resourceNode.self[ name ].creator = actionCreators[ name ]
    })
}

const defineStateLeafsbuilder = _defaultStates => (resourceNode, functionality, states = _defaultStates) => {
    const functionalityNode = new StandardAction(resourceNode, functionality)
    resourceNode.self[ functionality ] = functionalityNode
    states.map(name => functionalityNode[ name ] = new StandardAction(resourceNode, functionality, name))
}

const defineFunctionalityLeafsbuilder = _defaultFunctionalities =>
    (resourceNode, functionalities = _defaultFunctionalities, states) => {
        if (Array.isArray(functionalities)) {
            functionalities.forEach(name => buildStateLeafs(resourceNode, name, states))
        } else {
            Object.keys(functionalities).map(name => buildStateLeafs(resourceNode, name, functionalities[ name ]))
        }
    }

export const setDefaultFunctionalitiesAndStates = (_defaultFunctionalities = DEFATUL_FUNCTIONALITIES, _defaultStates = DEFATUL_STATES) => {
    buildStateLeafs = defineStateLeafsbuilder(_defaultStates)
    buildFunctionalityTree = defineFunctionalityLeafsbuilder(_defaultFunctionalities)
}

setDefaultFunctionalitiesAndStates()

const buildActionTree = (resourceDescriptors, _store = null, node = {}) => {
    if (_store) store = _store
    resourceDescriptors.forEach((resource) => {
        let parentResourceNode
        const newNode = { parent: node, name: resource.name, self: {} }

        if (node.name) {
            parentResourceNode = node.self
        } else parentResourceNode = node

        parentResourceNode[ resource.name ] = newNode.self
        buildFunctionalityTreefromActionCreators(newNode, resource.actionCreators)
        buildFunctionalityTree(newNode, resource.functionalities, resource.states)
        if (resource.sub) buildActionTree(resource.sub, null, newNode)
    })
    return node
}

export default buildActionTree
