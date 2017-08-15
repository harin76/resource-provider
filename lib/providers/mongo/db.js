'use strict'
const ObjectID = require('mongodb').ObjectID
const to = require('await-to-js').default
const ConnectionMgr = require('./connectionManager')

exports.find = async (tenant, coll, query, projection, page, limit) => {
  const [connError, mongo] = await to(ConnectionMgr.acquire())

  if (connError) {
    throw connError
  }

  limit = limit || 10
  page = page || 1
  query = query || {}
  const skip = page > 0 ? ((page - 1) * limit) : 0

  try {
    const collection = mongo.db(tenant).collection(coll)
    const [error, result] = await to(collection.find(query)
      .sort({_id: -1})
      .skip(skip)
      .limit(limit)
      .toArray())
    if (error) {
      throw error
    } else {
      return {
        cursor: {
          currentPage: page,
          perPage: limit
        },
        records: result
      }
    }
  } catch (error) {
    throw error
  } finally {
    // Release the connection after  us
    ConnectionMgr.release(mongo)
  }
}

const findOne = exports.findOne = async (tenant, coll, query) => {
  const [connError, mongo] = await to(ConnectionMgr.acquire())

  if (connError) {
    throw connError
  }

  try {
    const collection = mongo.db(tenant).collection(coll)
    const [error, result] = await to(collection.findOne(query))
    if (error) {
      throw error
    } else {
      return result
    }
  } catch (error) {
    throw error
  } finally {
    // Release the connection after use
    ConnectionMgr.release(mongo)
  }
}

exports.findById = async (tenant, coll, id) => {
  return findOne(tenant, coll, {_id: ObjectID(id)})
}

exports.insert = async (tenant, coll, payload) => {
  const [connError, mongo] = to(ConnectionMgr.acquire())

  if (connError) {
    throw connError
  }

  try {
    const collection = mongo.db(tenant).collection(coll)
    const [error, result] = await to(collection.insert(payload))

    if (error) {
      throw error
    } else {
      return result
    }
  } catch (error) {
    throw error
  } finally {
    ConnectionMgr.release(mongo)
  }
}

exports.update = async (tenant, coll, criteria, payload, returnOriginal = false) => {
  // Acquire a new connection
  const [connError, mongo] = to(ConnectionMgr.acquire())

  if (connError) {
    throw connError
  }

  try {
    const collection = mongo.db(tenant).collection(coll)
    const [error, result] = await to(collection
      .findOneAndUpdate(
        criteria,
        {$set: payload},
        {returnOriginal}
      ))
    if (error) {
      throw error
    } else {
      return result
    }
  } catch (error) {
    throw error
  } finally {
    ConnectionMgr.release(mongo)
  }
}

exports.findByIdAndUpdate = async (tenant, coll, id, payload, returnOriginal = false) => {
  return this.update(tenant, coll, {_id: ObjectID(id)}, payload, returnOriginal)
}

exports.remove = async (tenant, coll, criteria) => {
  // Acquire a new connection
  const [connError, mongo] = to(ConnectionMgr.acquire())
  if (connError) {
    throw connError
  }

  try {
    const collection = mongo.db(tenant).collection(coll)
    const [error, result] = await to(collection.findOneAndDelete(criteria))

    if (error) {
      throw error
    } else {
      return result
    }
  } catch (error) {
    throw error
  } finally {
    ConnectionMgr.release(mongo)
  }
}

exports.findByIdAndRemove = async (tenant, coll, id) => {
  return this.remove(tenant, coll, {_id: ObjectID(id)})
}

exports.connectionManager = ConnectionMgr
