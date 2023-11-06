const conditions = {
    NORMAL: "NORMAL",
    BURNED: "BURNED",
    PARALYZED: "PARALYZED",
    FROZEN: "FROZEN"
}

const userStatus = {
    NOT_IN_QUEST: 'NOT_IN_QUEST',
    IN_QUEST: 'IN_QUEST',
    IN_COMBAT: 'IN_COMBAT'
}

const questStatus = {
    NOT_ACTIVE: 'NOT_ACTIVE',
    ACTIVE: 'ACTIVE'
}

module.exports = {
    conditions,
    questStatus,
    userStatus
}