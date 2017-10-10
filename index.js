// import store from '../config/store'

// const allowedResources = [
//     {
//         name: 'users',
//         functionalities: [ 'add', 'remove' ],
//         states: [],
//     },
//     {
//         name: 'ideas',
//     },
//     {
//         name: 'drafts',
//         sub: [ {
//             name: 'priceRequests',
//             functionalities: [ 'add', 'remove' ],
//         } ],
//         functionalities: [ 'add', 'remove' ],
//         states: [ 'banana' ],
//     },
//     {
//         name: 'locations',
//         functionalities: { visit: [ 'now' ], leave: [] },
//         sub: [ {
//             name: 'restaurants',
//             sub: [
//                 { name: 'chairs' },
//             ],
//         } ],
//     },
//     {
//         name: 'redux',
//         functionalities: [],
//         actionCreators: {
//             undo: args => ({ type: 'undo', num: args }),
//             do: args => ({ type: 'redo', num: args }),
//         },
//     },

// ]

// export const store = { dispatch: args => console.log(args) }

export const DEFATUL_FUNCTIONALITIES = [ 'create', 'update', 'load', 'delete' ]
export const DEFAULT_STATES = [ 'toRequest', 'request', 'requested', 'responded', 'succeeded', 'failed' ]

function getTrace(resourceNode) {
    if (!resourceNode.name) return []
    return getTrace(resourceNode.parent).concat(resourceNode.name)
}

class StandardAction {
    constructor(resourceNode, functionality, state = null) {
        const resources = getTrace(resourceNode)
        this.type = resources
            .concat(functionality)
            .concat(state || [])
            .map(res => res.toUpperCase()).join('_')
        this.meta = { resources, functionality, state }
    }

    static getTrace(resourceNode) {
        if (!resourceNode.name) return []
        return StandardAction.getTrace(resourceNode.parent).concat(resourceNode.name)
    }

    set __beforeDispatch(filter) {
        this.__beforeDispatchFilter = filter
    }

    set __actionCreator(ac) {
        this.ac = ac
        this.dispatch = this.__sactionCreatorDispatch
        return this
    }

    set __afterDispatch(filter) {
        this.__safterDispatchFilter = filter
    }

    /* eslint-disable class-methods-use-this */

    __beforeDispatchFilter(payload, error) {
        return { payload, error }
    }

    /* eslint-enable */

    get __beforeDispatch() {
        return this.beforeDispatchFilter
    }

    __touchMeta(newMeta) {
        this.prevMeta = this.meta
        this.meta = Object.assign({}, this.meta, newMeta)
        return this
    }

    __resetMeta() {
        if (this.prevMeta) this.meta = this.prevMeta
        return this
    }

    __actionCreatorDispatch(...args) {
        return store.dispatch(this.ac(...args))
    }

    dispatch(...args) {
        const action = this.create(...args)
        return this
    }

    create(inputPayload, inputError = {}, inputMeta = {}) {
        const { payload, error } = this.beforeDispatchFilter(inputPayload, inputError)
        const meta = Object.assign({}, this.meta, inputMeta)
        const { type, meta } = this

        const action = {
 type, error, meta, payload 
}
        if (!this.neverResetMeta) this.resetMeta()
        return action
    }
}

export { StandardAction }

const buildFunctionalityTreefromActionCreators = (resourceDescriptors, resourceNode) => {
    const actionCreators = resourceDescriptors.actionCreators || []
    Object.keys(actionCreators).map((name) => {
        resourceNode.self[ name ] = new StandardAction(resourceNode, name)
        resourceNode.self[ name ].actionCreator = actionCreators[ name ]
    })
}

let buildFunctionalityTree = (resourceDescriptors, resourceNode) => {
    const functionalities = resourceDescriptors.functionalities || defaultFunctionalities
    const states = resourceDescriptors.states || defaultStates
    if (Array.isArray(functionalities)) {
        functionalities.forEach(name => buildStateLeafs(resourceNode, name, states))
    } else {
        Object.keys(functionalities).map(name => buildStateLeafs(resourceNode, name, functionalities[ name ]))
    }
}

// buildActions(store, description, {defaultFunctionalities, defaultStatus})

const defineStateLeafsbuilder = _defaultStates => (resourceNode, functionality, states = _defaultStates) => {
    const functionalityNode = new StandardAction(resourceNode, functionality)
    resourceNode.self[ functionality ] = functionalityNode
    states.map(name => functionalityNode[ name ] = new StandardAction(resourceNode, functionality, name))
}

const defineFunctionalityLeafsbuilder = _defaultFunctionalities => (resourceDescriptors, resourceNode) => {
    const functionalities = resourceDescriptors.functionalities || defaultFunctionalities
    if (Array.isArray(functionalities)) {
        functionalities.forEach(name => buildStateLeafs(resourceNode, name, resourceDescriptors.states))
    } else {
        Object.keys(functionalities).map(name => buildStateLeafs(resourceNode, name, functionalities[ name ]))
    }
}

export const setDefaultFunctionalitiesAndStates = (_defaultStates, _defaultFunctionalities) => {
    if (_defaultStates) buildStateLeafs = defineStateLeafsbuilder(defaultStates)
    if (_defaultFunctionalities) buildFunctionalityTree = defineFunctionalityLeafsbuilder(defaultFunctionalities)
}

let buildFunctionalityTree = defineFunctionalityLeafsbuilder(DEFATUL_FUNCTIONALITIES)
let buildStateLeafs = defineStateLeafsbuilder(DEFATUL_STATES)

const buildActionTree = (store, resourceDescriptors, options = {}) => {
    const { node } = options
    resourceDescriptors.forEach((resource) => {
        let parentResourceNode
        const newNode = { parent: node, name: resource.name, self: {} }

        if (node.name) {
            parentResourceNode = node.self
        } else parentResourceNode = node

        parentResourceNode[ resource.name ] = newNode.self
        buildFunctionalityTreefromActionCreators(resource, newNode)
        buildFunctionalityTree(resource, newNode)
        if (resource.sub) buildActionTree(resource.sub)
    })
    return node
}

export default buildActionTree

const actions = buildActionTree(allowedResources)
actions.drafts.priceRequests.add.toRequest.dispatch('bnanan')

actions.locations.restaurants.chairs.load.request.dispatch()
actions.locations.restaurants.chairs.load.dispatch()
actions.locations.restaurants.chairs.load.request.dispatch()
actions.locations.restaurants.chairs.load.request._internals()

actions.redux.undo.dispatch(123)
actions.redux.do.dispatch(3456)
