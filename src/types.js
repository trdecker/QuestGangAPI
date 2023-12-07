const conditions = {
    NORMAL: "NORMAL",
    BURNED: "BURNED",
    PARALYZED: "PARALYZED",
    FROZEN: "FROZEN"
}

const userActions = {
    ATTACK: "attack",
    RUN: "run"
}

const userStatus = {
    NOT_IN_QUEST: 'NOT_IN_QUEST',
    IN_QUEST: 'IN_QUEST',
    IN_COMBAT: 'IN_COMBAT',
    DEAD: 'DEAD'
}

const questStatus = {
    NOT_ACTIVE: 'NOT_ACTIVE',
    ACTIVE: 'ACTIVE',
    COMPLETE: 'COMPLETE',
    FAILED: 'FAILED',
    TERMINATED: 'TERMINATED'
}

const itemType = {
    ARMOR: 'armor',
    WEAPON: 'weapon'
    // Probably more
}

module.exports = {
    conditions,
    userActions,
    questStatus,
    userStatus,
    itemType
}