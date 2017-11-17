export const DEFATUL_FUNCTIONALITIES = [ 'create', 'update', 'load', 'delete' ]
export const DEFATUL_STATES = [ 'request', 'requested', 'responded', 'succeeded', 'failed' ]

function getTrace(resourceNode) {
    if (!resourceNode.name) return []
    return getTrace(resourceNode.parent).concat(resourceNode.name)
}

class StandardAction {
    constructor(store, resourceNode, functionality, state = null) {
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
        console.log(this.__store__)
        if (this.__store__ === null) return null
        this.__store__.dispatch(this.creator(...args))
        return this
    }

    creator(payload, error, meta = {}) {
        const newMeta = Object.assign({}, this.meta, meta)
        const { type } = this

        const action = {
            type, meta: newMeta,
        }
        if (error) action.error = error
        if (payload) action.payload = payload
        return action
    }
}

export { StandardAction }

let buildFunctionalityTree
let buildStateLeafs

const buildFunctionalityTreefromActionCreators = (_store, resourceNode, actionCreators = []) => {
    Object.keys(actionCreators).forEach((name) => {
        resourceNode.self[ name ] = new StandardAction(_store, resourceNode, name)
        resourceNode.self[ name ].creator = actionCreators[ name ]
    })
}

const defineStateLeafsbuilder = _defaultStates => (_store, resourceNode, functionality, states = _defaultStates) => {
    const functionalityNode = new StandardAction(_store, resourceNode, functionality)
    resourceNode.self[ functionality ] = functionalityNode
    states.map(name => functionalityNode[ name ] = new StandardAction(_store, resourceNode, functionality, name))
}

const defineFunctionalityLeafsbuilder = _defaultFunctionalities =>
    (_store, resourceNode, functionalities = _defaultFunctionalities, states) => {
        if (Array.isArray(functionalities)) {
            functionalities.forEach(name => buildStateLeafs(_store, resourceNode, name, states))
        } else {
            Object.keys(functionalities).map(name => buildStateLeafs(_store, resourceNode, name, functionalities[ name ]))
        }
    }

export const setDefaultFunctionalitiesAndStatuses = (_defaultFunctionalities = DEFATUL_FUNCTIONALITIES, _defaultStates = DEFATUL_STATES) => {
    buildStateLeafs = defineStateLeafsbuilder(_defaultStates)
    buildFunctionalityTree = defineFunctionalityLeafsbuilder(_defaultFunctionalities)
}

setDefaultFunctionalitiesAndStatuses()

const buildActionTree = (resourceDescriptors, _store = null, node = {}) => {
    resourceDescriptors.forEach((resource) => {
        let parentResourceNode
        const newNode = { parent: node, name: resource.name, self: {} }

        if (node.name) {
            parentResourceNode = node.self
        } else parentResourceNode = node

        parentResourceNode[ resource.name ] = newNode.self
        buildFunctionalityTreefromActionCreators(_store, newNode, resource.actionCreators)
        buildFunctionalityTree(_store, newNode, resource.functionalities, resource.states)
        if (resource.sub) buildActionTree(resource.sub, _store, newNode)
    })
    return node
}

export const makeDispatchable = (actionTree, _store) => {
    Object.keys(actionTree).forEach((key) => {
        if (actionTree[ key ] instanceof StandardAction) {
            Object.keys(actionTree[ key ]).forEach((child) => {
                // console.log(child)
                if (![ '__store__', 'meat', 'type' ].includes(child)) makeDispatchable(actionTree[ key ][ child ], _store)
            })
            actionTree[ key ].__store__ = _store
            return makeDispatchable(actionTree[ key ], _store)
        } else if (actionTree[ key ] instanceof Object) makeDispatchable(actionTree[ key ], _store)
    })
}

export default buildActionTree
