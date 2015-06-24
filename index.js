'use strict';

var _ = require('lodash');

module.exports = (function(schema, opts){
  ///////////////////
  // Configuration //
  ///////////////////

  /** Merge Default Options **/
  var options = {
    permitted: [],
    overrideMethods: false
  };
  if(opts) _.assign(options, opts);
  if(_.isString(options.permitted) && options.permitted.indexOf(' ') >= 0)
    options.permitted = options.permitted.split(' ');

  ////////////////////
  // Helper Methods //
  ////////////////////

  /**
   * Filter data with permitted params and apply overrides
   *
   * @param source      {Object} Source object
   * @param [override]  {Object} Overrides to apply after filtering
   *
   * @returns {Object}  Filtered object with overrides
   */
  var params = function(source, override){
    var filtered = _.pick(source, options.permitted);
    if(_.isPlainObject(override)) _.assign(filtered, override);
    return filtered;
  };

  //////////////////////
  // Instance Methods //
  //////////////////////

  _.assign(schema.methods, {
    only: function(params){
      if(arguments.length > 1) params = arguments;
      return _.pick(this.toObject(), params);
    },
    except: function(params){
      if(arguments.length > 1) params = arguments;
      return _.omit(this.toObject(), params);
    },

    /**
     * Filter assign to document
     *
     * @param source      {Object}  Source object
     * @param [override]  {Object}  Overrides to apply after filtering
     *
     * @returns {this}
     */
    assign: function(source, override){
      var filtered = params(source, override);
      return _.assign(this, filtered);
    },

    /**
     * Filter assign to a copy of the document
     *
     * @param source      {Object}  Source object
     * @param [override]  {Object}  Overrides to apply after filtering
     *
     * @returns {Document<this>} Copy of the document properties were assigned to
     */
    merge: function(source, override){
      var filtered = params(source, override);
      return _.merge(this, filtered);
    },

    /**
     * Perform an update with permitted params
     *
     * @param source      {Object}    Source object
     * @param [override]  {Object}    Overrides to apply after filtering
     * @param [done]      {Function}  Model.save callback
     *
     * @returns {Promise} The promise returned by Model.save
     */
    safeUpdate: function(source, override, done){
      return this.assign(source, override).save(_.isFunction(override) ? override : done);
    }
  });

  if(options.overrideMethods){
    /** Override Document.update to #safeUpdate **/
    _.assign(schema.methods, {
      update: schema.methods.safeUpdate
    });
  }

  ////////////////////
  // Static Methods //
  ////////////////////
  
  _.assign(schema.statics, {
    only: _.pick,
    except: _.omit,

    /**
     * Perform a create with permitted params
     *
     * @param docs        {Array|Object}  Source object(s)
     * @param [override]  {Object}        Overrides to apply after filtering
     * @param [done]      {Function}      Model.create callback
     *
     * @returns {Promise} Promise returned by Model.save 
     */
    safeCreate: function(docs, override, done){
      if(!_.isArray(docs)) docs = [docs];
      // 1) Produce filtered object based on 'permitted' properties
      // 2) Create a document with strict mode set to false 
      //    (to enable overrides)
      // 3) Save document, generating a promise
      // 4) Return a single promise with either a single potential value
      //    or an array of potential values, based on the type of parameter
      //    passed in
      var promises = _.map(docs, function(source){
        return params(source, override);
      }).map(function(filtered) {
        return new this(filtered, false);
      }, this).map(function(doc) {
        var fn = _.isFunction(override) ? override : done;
        if (_.isFunction(fn)) return doc.save(fn);
        else return doc.save();
      }, this);
      if (promises.length === 1) return promises[0];
      else return Promise.all(promises);
    }
  });

  if(options.overrideMethods){
    /** Override Model.create to #safeCreate **/
    _.assign(schema.statics, {
      create: schema.statics.safeCreate
    });
  }
});
