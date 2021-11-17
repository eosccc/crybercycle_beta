window.__require = function e(t, n, r) {
  function s(o, u) {
    if (!n[o]) {
      if (!t[o]) {
        var b = o.split("/");
        b = b[b.length - 1];
        if (!t[b]) {
          var a = "function" == typeof __require && __require;
          if (!u && a) return a(b, !0);
          if (i) return i(b, !0);
          throw new Error("Cannot find module '" + o + "'");
        }
        o = b;
      }
      var f = n[o] = {
        exports: {}
      };
      t[o][0].call(f.exports, function(e) {
        var n = t[o][1][e];
        return s(n || e);
      }, f, f.exports, e, t, n, r);
    }
    return n[o].exports;
  }
  var i = "function" == typeof __require && __require;
  for (var o = 0; o < r.length; o++) s(r[o]);
  return s;
}({
  1: [ function(require, module, exports) {
    var process = module.exports = {};
    var cachedSetTimeout;
    var cachedClearTimeout;
    function defaultSetTimout() {
      throw new Error("setTimeout has not been defined");
    }
    function defaultClearTimeout() {
      throw new Error("clearTimeout has not been defined");
    }
    (function() {
      try {
        cachedSetTimeout = "function" === typeof setTimeout ? setTimeout : defaultSetTimout;
      } catch (e) {
        cachedSetTimeout = defaultSetTimout;
      }
      try {
        cachedClearTimeout = "function" === typeof clearTimeout ? clearTimeout : defaultClearTimeout;
      } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
      }
    })();
    function runTimeout(fun) {
      if (cachedSetTimeout === setTimeout) return setTimeout(fun, 0);
      if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
      }
      try {
        return cachedSetTimeout(fun, 0);
      } catch (e) {
        try {
          return cachedSetTimeout.call(null, fun, 0);
        } catch (e) {
          return cachedSetTimeout.call(this, fun, 0);
        }
      }
    }
    function runClearTimeout(marker) {
      if (cachedClearTimeout === clearTimeout) return clearTimeout(marker);
      if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
      }
      try {
        return cachedClearTimeout(marker);
      } catch (e) {
        try {
          return cachedClearTimeout.call(null, marker);
        } catch (e) {
          return cachedClearTimeout.call(this, marker);
        }
      }
    }
    var queue = [];
    var draining = false;
    var currentQueue;
    var queueIndex = -1;
    function cleanUpNextTick() {
      if (!draining || !currentQueue) return;
      draining = false;
      currentQueue.length ? queue = currentQueue.concat(queue) : queueIndex = -1;
      queue.length && drainQueue();
    }
    function drainQueue() {
      if (draining) return;
      var timeout = runTimeout(cleanUpNextTick);
      draining = true;
      var len = queue.length;
      while (len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) currentQueue && currentQueue[queueIndex].run();
        queueIndex = -1;
        len = queue.length;
      }
      currentQueue = null;
      draining = false;
      runClearTimeout(timeout);
    }
    process.nextTick = function(fun) {
      var args = new Array(arguments.length - 1);
      if (arguments.length > 1) for (var i = 1; i < arguments.length; i++) args[i - 1] = arguments[i];
      queue.push(new Item(fun, args));
      1 !== queue.length || draining || runTimeout(drainQueue);
    };
    function Item(fun, array) {
      this.fun = fun;
      this.array = array;
    }
    Item.prototype.run = function() {
      this.fun.apply(null, this.array);
    };
    process.title = "browser";
    process.browser = true;
    process.env = {};
    process.argv = [];
    process.version = "";
    process.versions = {};
    function noop() {}
    process.on = noop;
    process.addListener = noop;
    process.once = noop;
    process.off = noop;
    process.removeListener = noop;
    process.removeAllListeners = noop;
    process.emit = noop;
    process.prependListener = noop;
    process.prependOnceListener = noop;
    process.listeners = function(name) {
      return [];
    };
    process.binding = function(name) {
      throw new Error("process.binding is not supported");
    };
    process.cwd = function() {
      return "/";
    };
    process.chdir = function(dir) {
      throw new Error("process.chdir is not supported");
    };
    process.umask = function() {
      return 0;
    };
  }, {} ],
  2: [ function(require, module, exports) {
    (function(process) {
      (function(global, factory) {
        "object" === typeof exports && "undefined" !== typeof module ? factory(exports) : "function" === typeof define && define.amd ? define([ "exports" ], factory) : factory(global.async = {});
      })(this, function(exports) {
        "use strict";
        function apply(fn, ...args) {
          return (...callArgs) => fn(...args, ...callArgs);
        }
        function initialParams(fn) {
          return function(...args) {
            var callback = args.pop();
            return fn.call(this, args, callback);
          };
        }
        var hasQueueMicrotask = "function" === typeof queueMicrotask && queueMicrotask;
        var hasSetImmediate = "function" === typeof setImmediate && setImmediate;
        var hasNextTick = "object" === typeof process && "function" === typeof process.nextTick;
        function fallback(fn) {
          setTimeout(fn, 0);
        }
        function wrap(defer) {
          return (fn, ...args) => defer(() => fn(...args));
        }
        var _defer;
        _defer = hasQueueMicrotask ? queueMicrotask : hasSetImmediate ? setImmediate : hasNextTick ? process.nextTick : fallback;
        var setImmediate$1 = wrap(_defer);
        function asyncify(func) {
          if (isAsync(func)) return function(...args) {
            const callback = args.pop();
            const promise = func.apply(this, args);
            return handlePromise(promise, callback);
          };
          return initialParams(function(args, callback) {
            var result;
            try {
              result = func.apply(this, args);
            } catch (e) {
              return callback(e);
            }
            if (result && "function" === typeof result.then) return handlePromise(result, callback);
            callback(null, result);
          });
        }
        function handlePromise(promise, callback) {
          return promise.then(value => {
            invokeCallback(callback, null, value);
          }, err => {
            invokeCallback(callback, err && err.message ? err : new Error(err));
          });
        }
        function invokeCallback(callback, error, value) {
          try {
            callback(error, value);
          } catch (err) {
            setImmediate$1(e => {
              throw e;
            }, err);
          }
        }
        function isAsync(fn) {
          return "AsyncFunction" === fn[Symbol.toStringTag];
        }
        function isAsyncGenerator(fn) {
          return "AsyncGenerator" === fn[Symbol.toStringTag];
        }
        function isAsyncIterable(obj) {
          return "function" === typeof obj[Symbol.asyncIterator];
        }
        function wrapAsync(asyncFn) {
          if ("function" !== typeof asyncFn) throw new Error("expected a function");
          return isAsync(asyncFn) ? asyncify(asyncFn) : asyncFn;
        }
        function awaitify(asyncFn, arity = asyncFn.length) {
          if (!arity) throw new Error("arity is undefined");
          function awaitable(...args) {
            if ("function" === typeof args[arity - 1]) return asyncFn.apply(this, args);
            return new Promise((resolve, reject) => {
              args[arity - 1] = (err, ...cbArgs) => {
                if (err) return reject(err);
                resolve(cbArgs.length > 1 ? cbArgs : cbArgs[0]);
              };
              asyncFn.apply(this, args);
            });
          }
          return awaitable;
        }
        function applyEach(eachfn) {
          return function applyEach(fns, ...callArgs) {
            const go = awaitify(function(callback) {
              var that = this;
              return eachfn(fns, (fn, cb) => {
                wrapAsync(fn).apply(that, callArgs.concat(cb));
              }, callback);
            });
            return go;
          };
        }
        function _asyncMap(eachfn, arr, iteratee, callback) {
          arr = arr || [];
          var results = [];
          var counter = 0;
          var _iteratee = wrapAsync(iteratee);
          return eachfn(arr, (value, _, iterCb) => {
            var index = counter++;
            _iteratee(value, (err, v) => {
              results[index] = v;
              iterCb(err);
            });
          }, err => {
            callback(err, results);
          });
        }
        function isArrayLike(value) {
          return value && "number" === typeof value.length && value.length >= 0 && value.length % 1 === 0;
        }
        const breakLoop = {};
        function once(fn) {
          function wrapper(...args) {
            if (null === fn) return;
            var callFn = fn;
            fn = null;
            callFn.apply(this, args);
          }
          Object.assign(wrapper, fn);
          return wrapper;
        }
        function getIterator(coll) {
          return coll[Symbol.iterator] && coll[Symbol.iterator]();
        }
        function createArrayIterator(coll) {
          var i = -1;
          var len = coll.length;
          return function next() {
            return ++i < len ? {
              value: coll[i],
              key: i
            } : null;
          };
        }
        function createES2015Iterator(iterator) {
          var i = -1;
          return function next() {
            var item = iterator.next();
            if (item.done) return null;
            i++;
            return {
              value: item.value,
              key: i
            };
          };
        }
        function createObjectIterator(obj) {
          var okeys = obj ? Object.keys(obj) : [];
          var i = -1;
          var len = okeys.length;
          return function next() {
            var key = okeys[++i];
            return i < len ? {
              value: obj[key],
              key: key
            } : null;
          };
        }
        function createIterator(coll) {
          if (isArrayLike(coll)) return createArrayIterator(coll);
          var iterator = getIterator(coll);
          return iterator ? createES2015Iterator(iterator) : createObjectIterator(coll);
        }
        function onlyOnce(fn) {
          return function(...args) {
            if (null === fn) throw new Error("Callback was already called.");
            var callFn = fn;
            fn = null;
            callFn.apply(this, args);
          };
        }
        function asyncEachOfLimit(generator, limit, iteratee, callback) {
          let done = false;
          let canceled = false;
          let awaiting = false;
          let running = 0;
          let idx = 0;
          function replenish() {
            if (running >= limit || awaiting || done) return;
            awaiting = true;
            generator.next().then(({value: value, done: iterDone}) => {
              if (canceled || done) return;
              awaiting = false;
              if (iterDone) {
                done = true;
                running <= 0 && callback(null);
                return;
              }
              running++;
              iteratee(value, idx, iterateeCallback);
              idx++;
              replenish();
            }).catch(handleError);
          }
          function iterateeCallback(err, result) {
            running -= 1;
            if (canceled) return;
            if (err) return handleError(err);
            if (false === err) {
              done = true;
              canceled = true;
              return;
            }
            if (result === breakLoop || done && running <= 0) {
              done = true;
              return callback(null);
            }
            replenish();
          }
          function handleError(err) {
            if (canceled) return;
            awaiting = false;
            done = true;
            callback(err);
          }
          replenish();
        }
        var eachOfLimit = limit => (obj, iteratee, callback) => {
          callback = once(callback);
          if (limit <= 0) throw new RangeError("concurrency limit cannot be less than 1");
          if (!obj) return callback(null);
          if (isAsyncGenerator(obj)) return asyncEachOfLimit(obj, limit, iteratee, callback);
          if (isAsyncIterable(obj)) return asyncEachOfLimit(obj[Symbol.asyncIterator](), limit, iteratee, callback);
          var nextElem = createIterator(obj);
          var done = false;
          var canceled = false;
          var running = 0;
          var looping = false;
          function iterateeCallback(err, value) {
            if (canceled) return;
            running -= 1;
            if (err) {
              done = true;
              callback(err);
            } else if (false === err) {
              done = true;
              canceled = true;
            } else {
              if (value === breakLoop || done && running <= 0) {
                done = true;
                return callback(null);
              }
              looping || replenish();
            }
          }
          function replenish() {
            looping = true;
            while (running < limit && !done) {
              var elem = nextElem();
              if (null === elem) {
                done = true;
                running <= 0 && callback(null);
                return;
              }
              running += 1;
              iteratee(elem.value, elem.key, onlyOnce(iterateeCallback));
            }
            looping = false;
          }
          replenish();
        };
        function eachOfLimit$1(coll, limit, iteratee, callback) {
          return eachOfLimit(limit)(coll, wrapAsync(iteratee), callback);
        }
        var eachOfLimit$2 = awaitify(eachOfLimit$1, 4);
        function eachOfArrayLike(coll, iteratee, callback) {
          callback = once(callback);
          var index = 0, completed = 0, {length: length} = coll, canceled = false;
          0 === length && callback(null);
          function iteratorCallback(err, value) {
            false === err && (canceled = true);
            if (true === canceled) return;
            err ? callback(err) : ++completed !== length && value !== breakLoop || callback(null);
          }
          for (;index < length; index++) iteratee(coll[index], index, onlyOnce(iteratorCallback));
        }
        function eachOfGeneric(coll, iteratee, callback) {
          return eachOfLimit$2(coll, Infinity, iteratee, callback);
        }
        function eachOf(coll, iteratee, callback) {
          var eachOfImplementation = isArrayLike(coll) ? eachOfArrayLike : eachOfGeneric;
          return eachOfImplementation(coll, wrapAsync(iteratee), callback);
        }
        var eachOf$1 = awaitify(eachOf, 3);
        function map(coll, iteratee, callback) {
          return _asyncMap(eachOf$1, coll, iteratee, callback);
        }
        var map$1 = awaitify(map, 3);
        var applyEach$1 = applyEach(map$1);
        function eachOfSeries(coll, iteratee, callback) {
          return eachOfLimit$2(coll, 1, iteratee, callback);
        }
        var eachOfSeries$1 = awaitify(eachOfSeries, 3);
        function mapSeries(coll, iteratee, callback) {
          return _asyncMap(eachOfSeries$1, coll, iteratee, callback);
        }
        var mapSeries$1 = awaitify(mapSeries, 3);
        var applyEachSeries = applyEach(mapSeries$1);
        const PROMISE_SYMBOL = Symbol("promiseCallback");
        function promiseCallback() {
          let resolve, reject;
          function callback(err, ...args) {
            if (err) return reject(err);
            resolve(args.length > 1 ? args : args[0]);
          }
          callback[PROMISE_SYMBOL] = new Promise((res, rej) => {
            resolve = res, reject = rej;
          });
          return callback;
        }
        function auto(tasks, concurrency, callback) {
          if ("number" !== typeof concurrency) {
            callback = concurrency;
            concurrency = null;
          }
          callback = once(callback || promiseCallback());
          var numTasks = Object.keys(tasks).length;
          if (!numTasks) return callback(null);
          concurrency || (concurrency = numTasks);
          var results = {};
          var runningTasks = 0;
          var canceled = false;
          var hasError = false;
          var listeners = Object.create(null);
          var readyTasks = [];
          var readyToCheck = [];
          var uncheckedDependencies = {};
          Object.keys(tasks).forEach(key => {
            var task = tasks[key];
            if (!Array.isArray(task)) {
              enqueueTask(key, [ task ]);
              readyToCheck.push(key);
              return;
            }
            var dependencies = task.slice(0, task.length - 1);
            var remainingDependencies = dependencies.length;
            if (0 === remainingDependencies) {
              enqueueTask(key, task);
              readyToCheck.push(key);
              return;
            }
            uncheckedDependencies[key] = remainingDependencies;
            dependencies.forEach(dependencyName => {
              if (!tasks[dependencyName]) throw new Error("async.auto task `" + key + "` has a non-existent dependency `" + dependencyName + "` in " + dependencies.join(", "));
              addListener(dependencyName, () => {
                remainingDependencies--;
                0 === remainingDependencies && enqueueTask(key, task);
              });
            });
          });
          checkForDeadlocks();
          processQueue();
          function enqueueTask(key, task) {
            readyTasks.push(() => runTask(key, task));
          }
          function processQueue() {
            if (canceled) return;
            if (0 === readyTasks.length && 0 === runningTasks) return callback(null, results);
            while (readyTasks.length && runningTasks < concurrency) {
              var run = readyTasks.shift();
              run();
            }
          }
          function addListener(taskName, fn) {
            var taskListeners = listeners[taskName];
            taskListeners || (taskListeners = listeners[taskName] = []);
            taskListeners.push(fn);
          }
          function taskComplete(taskName) {
            var taskListeners = listeners[taskName] || [];
            taskListeners.forEach(fn => fn());
            processQueue();
          }
          function runTask(key, task) {
            if (hasError) return;
            var taskCallback = onlyOnce((err, ...result) => {
              runningTasks--;
              if (false === err) {
                canceled = true;
                return;
              }
              result.length < 2 && ([result] = result);
              if (err) {
                var safeResults = {};
                Object.keys(results).forEach(rkey => {
                  safeResults[rkey] = results[rkey];
                });
                safeResults[key] = result;
                hasError = true;
                listeners = Object.create(null);
                if (canceled) return;
                callback(err, safeResults);
              } else {
                results[key] = result;
                taskComplete(key);
              }
            });
            runningTasks++;
            var taskFn = wrapAsync(task[task.length - 1]);
            task.length > 1 ? taskFn(results, taskCallback) : taskFn(taskCallback);
          }
          function checkForDeadlocks() {
            var currentTask;
            var counter = 0;
            while (readyToCheck.length) {
              currentTask = readyToCheck.pop();
              counter++;
              getDependents(currentTask).forEach(dependent => {
                0 === --uncheckedDependencies[dependent] && readyToCheck.push(dependent);
              });
            }
            if (counter !== numTasks) throw new Error("async.auto cannot execute tasks due to a recursive dependency");
          }
          function getDependents(taskName) {
            var result = [];
            Object.keys(tasks).forEach(key => {
              const task = tasks[key];
              Array.isArray(task) && task.indexOf(taskName) >= 0 && result.push(key);
            });
            return result;
          }
          return callback[PROMISE_SYMBOL];
        }
        var FN_ARGS = /^(?:async\s+)?(?:function)?\s*\w*\s*\(\s*([^)]+)\s*\)(?:\s*{)/;
        var ARROW_FN_ARGS = /^(?:async\s+)?\(?\s*([^)=]+)\s*\)?(?:\s*=>)/;
        var FN_ARG_SPLIT = /,/;
        var FN_ARG = /(=.+)?(\s*)$/;
        var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm;
        function parseParams(func) {
          const src = func.toString().replace(STRIP_COMMENTS, "");
          let match = src.match(FN_ARGS);
          match || (match = src.match(ARROW_FN_ARGS));
          if (!match) throw new Error("could not parse args in autoInject\nSource:\n" + src);
          let [, args] = match;
          return args.replace(/\s/g, "").split(FN_ARG_SPLIT).map(arg => arg.replace(FN_ARG, "").trim());
        }
        function autoInject(tasks, callback) {
          var newTasks = {};
          Object.keys(tasks).forEach(key => {
            var taskFn = tasks[key];
            var params;
            var fnIsAsync = isAsync(taskFn);
            var hasNoDeps = !fnIsAsync && 1 === taskFn.length || fnIsAsync && 0 === taskFn.length;
            if (Array.isArray(taskFn)) {
              params = [ ...taskFn ];
              taskFn = params.pop();
              newTasks[key] = params.concat(params.length > 0 ? newTask : taskFn);
            } else if (hasNoDeps) newTasks[key] = taskFn; else {
              params = parseParams(taskFn);
              if (0 === taskFn.length && !fnIsAsync && 0 === params.length) throw new Error("autoInject task functions require explicit parameters.");
              fnIsAsync || params.pop();
              newTasks[key] = params.concat(newTask);
            }
            function newTask(results, taskCb) {
              var newArgs = params.map(name => results[name]);
              newArgs.push(taskCb);
              wrapAsync(taskFn)(...newArgs);
            }
          });
          return auto(newTasks, callback);
        }
        class DLL {
          constructor() {
            this.head = this.tail = null;
            this.length = 0;
          }
          removeLink(node) {
            node.prev ? node.prev.next = node.next : this.head = node.next;
            node.next ? node.next.prev = node.prev : this.tail = node.prev;
            node.prev = node.next = null;
            this.length -= 1;
            return node;
          }
          empty() {
            while (this.head) this.shift();
            return this;
          }
          insertAfter(node, newNode) {
            newNode.prev = node;
            newNode.next = node.next;
            node.next ? node.next.prev = newNode : this.tail = newNode;
            node.next = newNode;
            this.length += 1;
          }
          insertBefore(node, newNode) {
            newNode.prev = node.prev;
            newNode.next = node;
            node.prev ? node.prev.next = newNode : this.head = newNode;
            node.prev = newNode;
            this.length += 1;
          }
          unshift(node) {
            this.head ? this.insertBefore(this.head, node) : setInitial(this, node);
          }
          push(node) {
            this.tail ? this.insertAfter(this.tail, node) : setInitial(this, node);
          }
          shift() {
            return this.head && this.removeLink(this.head);
          }
          pop() {
            return this.tail && this.removeLink(this.tail);
          }
          toArray() {
            return [ ...this ];
          }
          * [Symbol.iterator]() {
            var cur = this.head;
            while (cur) {
              yield cur.data;
              cur = cur.next;
            }
          }
          remove(testFn) {
            var curr = this.head;
            while (curr) {
              var {next: next} = curr;
              testFn(curr) && this.removeLink(curr);
              curr = next;
            }
            return this;
          }
        }
        function setInitial(dll, node) {
          dll.length = 1;
          dll.head = dll.tail = node;
        }
        function queue(worker, concurrency, payload) {
          if (null == concurrency) concurrency = 1; else if (0 === concurrency) throw new RangeError("Concurrency must not be zero");
          var _worker = wrapAsync(worker);
          var numRunning = 0;
          var workersList = [];
          const events = {
            error: [],
            drain: [],
            saturated: [],
            unsaturated: [],
            empty: []
          };
          function on(event, handler) {
            events[event].push(handler);
          }
          function once(event, handler) {
            const handleAndRemove = (...args) => {
              off(event, handleAndRemove);
              handler(...args);
            };
            events[event].push(handleAndRemove);
          }
          function off(event, handler) {
            if (!event) return Object.keys(events).forEach(ev => events[ev] = []);
            if (!handler) return events[event] = [];
            events[event] = events[event].filter(ev => ev !== handler);
          }
          function trigger(event, ...args) {
            events[event].forEach(handler => handler(...args));
          }
          var processingScheduled = false;
          function _insert(data, insertAtFront, rejectOnError, callback) {
            if (null != callback && "function" !== typeof callback) throw new Error("task callback must be a function");
            q.started = true;
            var res, rej;
            function promiseCallback(err, ...args) {
              if (err) return rejectOnError ? rej(err) : res();
              if (args.length <= 1) return res(args[0]);
              res(args);
            }
            var item = {
              data: data,
              callback: rejectOnError ? promiseCallback : callback || promiseCallback
            };
            insertAtFront ? q._tasks.unshift(item) : q._tasks.push(item);
            if (!processingScheduled) {
              processingScheduled = true;
              setImmediate$1(() => {
                processingScheduled = false;
                q.process();
              });
            }
            if (rejectOnError || !callback) return new Promise((resolve, reject) => {
              res = resolve;
              rej = reject;
            });
          }
          function _createCB(tasks) {
            return function(err, ...args) {
              numRunning -= 1;
              for (var i = 0, l = tasks.length; i < l; i++) {
                var task = tasks[i];
                var index = workersList.indexOf(task);
                0 === index ? workersList.shift() : index > 0 && workersList.splice(index, 1);
                task.callback(err, ...args);
                null != err && trigger("error", err, task.data);
              }
              numRunning <= q.concurrency - q.buffer && trigger("unsaturated");
              q.idle() && trigger("drain");
              q.process();
            };
          }
          function _maybeDrain(data) {
            if (0 === data.length && q.idle()) {
              setImmediate$1(() => trigger("drain"));
              return true;
            }
            return false;
          }
          const eventMethod = name => handler => {
            if (!handler) return new Promise((resolve, reject) => {
              once(name, (err, data) => {
                if (err) return reject(err);
                resolve(data);
              });
            });
            off(name);
            on(name, handler);
          };
          var isProcessing = false;
          var q = {
            _tasks: new DLL(),
            * [Symbol.iterator]() {
              yield* q._tasks[Symbol.iterator]();
            },
            concurrency: concurrency,
            payload: payload,
            buffer: concurrency / 4,
            started: false,
            paused: false,
            push(data, callback) {
              if (Array.isArray(data)) {
                if (_maybeDrain(data)) return;
                return data.map(datum => _insert(datum, false, false, callback));
              }
              return _insert(data, false, false, callback);
            },
            pushAsync(data, callback) {
              if (Array.isArray(data)) {
                if (_maybeDrain(data)) return;
                return data.map(datum => _insert(datum, false, true, callback));
              }
              return _insert(data, false, true, callback);
            },
            kill() {
              off();
              q._tasks.empty();
            },
            unshift(data, callback) {
              if (Array.isArray(data)) {
                if (_maybeDrain(data)) return;
                return data.map(datum => _insert(datum, true, false, callback));
              }
              return _insert(data, true, false, callback);
            },
            unshiftAsync(data, callback) {
              if (Array.isArray(data)) {
                if (_maybeDrain(data)) return;
                return data.map(datum => _insert(datum, true, true, callback));
              }
              return _insert(data, true, true, callback);
            },
            remove(testFn) {
              q._tasks.remove(testFn);
            },
            process() {
              if (isProcessing) return;
              isProcessing = true;
              while (!q.paused && numRunning < q.concurrency && q._tasks.length) {
                var tasks = [], data = [];
                var l = q._tasks.length;
                q.payload && (l = Math.min(l, q.payload));
                for (var i = 0; i < l; i++) {
                  var node = q._tasks.shift();
                  tasks.push(node);
                  workersList.push(node);
                  data.push(node.data);
                }
                numRunning += 1;
                0 === q._tasks.length && trigger("empty");
                numRunning === q.concurrency && trigger("saturated");
                var cb = onlyOnce(_createCB(tasks));
                _worker(data, cb);
              }
              isProcessing = false;
            },
            length: () => q._tasks.length,
            running: () => numRunning,
            workersList: () => workersList,
            idle: () => q._tasks.length + numRunning === 0,
            pause() {
              q.paused = true;
            },
            resume() {
              if (false === q.paused) return;
              q.paused = false;
              setImmediate$1(q.process);
            }
          };
          Object.defineProperties(q, {
            saturated: {
              writable: false,
              value: eventMethod("saturated")
            },
            unsaturated: {
              writable: false,
              value: eventMethod("unsaturated")
            },
            empty: {
              writable: false,
              value: eventMethod("empty")
            },
            drain: {
              writable: false,
              value: eventMethod("drain")
            },
            error: {
              writable: false,
              value: eventMethod("error")
            }
          });
          return q;
        }
        function cargo(worker, payload) {
          return queue(worker, 1, payload);
        }
        function cargo$1(worker, concurrency, payload) {
          return queue(worker, concurrency, payload);
        }
        function reduce(coll, memo, iteratee, callback) {
          callback = once(callback);
          var _iteratee = wrapAsync(iteratee);
          return eachOfSeries$1(coll, (x, i, iterCb) => {
            _iteratee(memo, x, (err, v) => {
              memo = v;
              iterCb(err);
            });
          }, err => callback(err, memo));
        }
        var reduce$1 = awaitify(reduce, 4);
        function seq(...functions) {
          var _functions = functions.map(wrapAsync);
          return function(...args) {
            var that = this;
            var cb = args[args.length - 1];
            "function" == typeof cb ? args.pop() : cb = promiseCallback();
            reduce$1(_functions, args, (newargs, fn, iterCb) => {
              fn.apply(that, newargs.concat((err, ...nextargs) => {
                iterCb(err, nextargs);
              }));
            }, (err, results) => cb(err, ...results));
            return cb[PROMISE_SYMBOL];
          };
        }
        function compose(...args) {
          return seq(...args.reverse());
        }
        function mapLimit(coll, limit, iteratee, callback) {
          return _asyncMap(eachOfLimit(limit), coll, iteratee, callback);
        }
        var mapLimit$1 = awaitify(mapLimit, 4);
        function concatLimit(coll, limit, iteratee, callback) {
          var _iteratee = wrapAsync(iteratee);
          return mapLimit$1(coll, limit, (val, iterCb) => {
            _iteratee(val, (err, ...args) => {
              if (err) return iterCb(err);
              return iterCb(err, args);
            });
          }, (err, mapResults) => {
            var result = [];
            for (var i = 0; i < mapResults.length; i++) mapResults[i] && (result = result.concat(...mapResults[i]));
            return callback(err, result);
          });
        }
        var concatLimit$1 = awaitify(concatLimit, 4);
        function concat(coll, iteratee, callback) {
          return concatLimit$1(coll, Infinity, iteratee, callback);
        }
        var concat$1 = awaitify(concat, 3);
        function concatSeries(coll, iteratee, callback) {
          return concatLimit$1(coll, 1, iteratee, callback);
        }
        var concatSeries$1 = awaitify(concatSeries, 3);
        function constant(...args) {
          return function(...ignoredArgs) {
            var callback = ignoredArgs.pop();
            return callback(null, ...args);
          };
        }
        function _createTester(check, getResult) {
          return (eachfn, arr, _iteratee, cb) => {
            var testPassed = false;
            var testResult;
            const iteratee = wrapAsync(_iteratee);
            eachfn(arr, (value, _, callback) => {
              iteratee(value, (err, result) => {
                if (err || false === err) return callback(err);
                if (check(result) && !testResult) {
                  testPassed = true;
                  testResult = getResult(true, value);
                  return callback(null, breakLoop);
                }
                callback();
              });
            }, err => {
              if (err) return cb(err);
              cb(null, testPassed ? testResult : getResult(false));
            });
          };
        }
        function detect(coll, iteratee, callback) {
          return _createTester(bool => bool, (res, item) => item)(eachOf$1, coll, iteratee, callback);
        }
        var detect$1 = awaitify(detect, 3);
        function detectLimit(coll, limit, iteratee, callback) {
          return _createTester(bool => bool, (res, item) => item)(eachOfLimit(limit), coll, iteratee, callback);
        }
        var detectLimit$1 = awaitify(detectLimit, 4);
        function detectSeries(coll, iteratee, callback) {
          return _createTester(bool => bool, (res, item) => item)(eachOfLimit(1), coll, iteratee, callback);
        }
        var detectSeries$1 = awaitify(detectSeries, 3);
        function consoleFunc(name) {
          return (fn, ...args) => wrapAsync(fn)(...args, (err, ...resultArgs) => {
            "object" === typeof console && (err ? console.error && console.error(err) : console[name] && resultArgs.forEach(x => console[name](x)));
          });
        }
        var dir = consoleFunc("dir");
        function doWhilst(iteratee, test, callback) {
          callback = onlyOnce(callback);
          var _fn = wrapAsync(iteratee);
          var _test = wrapAsync(test);
          var results;
          function next(err, ...args) {
            if (err) return callback(err);
            if (false === err) return;
            results = args;
            _test(...args, check);
          }
          function check(err, truth) {
            if (err) return callback(err);
            if (false === err) return;
            if (!truth) return callback(null, ...results);
            _fn(next);
          }
          return check(null, true);
        }
        var doWhilst$1 = awaitify(doWhilst, 3);
        function doUntil(iteratee, test, callback) {
          const _test = wrapAsync(test);
          return doWhilst$1(iteratee, (...args) => {
            const cb = args.pop();
            _test(...args, (err, truth) => cb(err, !truth));
          }, callback);
        }
        function _withoutIndex(iteratee) {
          return (value, index, callback) => iteratee(value, callback);
        }
        function eachLimit(coll, iteratee, callback) {
          return eachOf$1(coll, _withoutIndex(wrapAsync(iteratee)), callback);
        }
        var each = awaitify(eachLimit, 3);
        function eachLimit$1(coll, limit, iteratee, callback) {
          return eachOfLimit(limit)(coll, _withoutIndex(wrapAsync(iteratee)), callback);
        }
        var eachLimit$2 = awaitify(eachLimit$1, 4);
        function eachSeries(coll, iteratee, callback) {
          return eachLimit$2(coll, 1, iteratee, callback);
        }
        var eachSeries$1 = awaitify(eachSeries, 3);
        function ensureAsync(fn) {
          if (isAsync(fn)) return fn;
          return function(...args) {
            var callback = args.pop();
            var sync = true;
            args.push((...innerArgs) => {
              sync ? setImmediate$1(() => callback(...innerArgs)) : callback(...innerArgs);
            });
            fn.apply(this, args);
            sync = false;
          };
        }
        function every(coll, iteratee, callback) {
          return _createTester(bool => !bool, res => !res)(eachOf$1, coll, iteratee, callback);
        }
        var every$1 = awaitify(every, 3);
        function everyLimit(coll, limit, iteratee, callback) {
          return _createTester(bool => !bool, res => !res)(eachOfLimit(limit), coll, iteratee, callback);
        }
        var everyLimit$1 = awaitify(everyLimit, 4);
        function everySeries(coll, iteratee, callback) {
          return _createTester(bool => !bool, res => !res)(eachOfSeries$1, coll, iteratee, callback);
        }
        var everySeries$1 = awaitify(everySeries, 3);
        function filterArray(eachfn, arr, iteratee, callback) {
          var truthValues = new Array(arr.length);
          eachfn(arr, (x, index, iterCb) => {
            iteratee(x, (err, v) => {
              truthValues[index] = !!v;
              iterCb(err);
            });
          }, err => {
            if (err) return callback(err);
            var results = [];
            for (var i = 0; i < arr.length; i++) truthValues[i] && results.push(arr[i]);
            callback(null, results);
          });
        }
        function filterGeneric(eachfn, coll, iteratee, callback) {
          var results = [];
          eachfn(coll, (x, index, iterCb) => {
            iteratee(x, (err, v) => {
              if (err) return iterCb(err);
              v && results.push({
                index: index,
                value: x
              });
              iterCb(err);
            });
          }, err => {
            if (err) return callback(err);
            callback(null, results.sort((a, b) => a.index - b.index).map(v => v.value));
          });
        }
        function _filter(eachfn, coll, iteratee, callback) {
          var filter = isArrayLike(coll) ? filterArray : filterGeneric;
          return filter(eachfn, coll, wrapAsync(iteratee), callback);
        }
        function filter(coll, iteratee, callback) {
          return _filter(eachOf$1, coll, iteratee, callback);
        }
        var filter$1 = awaitify(filter, 3);
        function filterLimit(coll, limit, iteratee, callback) {
          return _filter(eachOfLimit(limit), coll, iteratee, callback);
        }
        var filterLimit$1 = awaitify(filterLimit, 4);
        function filterSeries(coll, iteratee, callback) {
          return _filter(eachOfSeries$1, coll, iteratee, callback);
        }
        var filterSeries$1 = awaitify(filterSeries, 3);
        function forever(fn, errback) {
          var done = onlyOnce(errback);
          var task = wrapAsync(ensureAsync(fn));
          function next(err) {
            if (err) return done(err);
            if (false === err) return;
            task(next);
          }
          return next();
        }
        var forever$1 = awaitify(forever, 2);
        function groupByLimit(coll, limit, iteratee, callback) {
          var _iteratee = wrapAsync(iteratee);
          return mapLimit$1(coll, limit, (val, iterCb) => {
            _iteratee(val, (err, key) => {
              if (err) return iterCb(err);
              return iterCb(err, {
                key: key,
                val: val
              });
            });
          }, (err, mapResults) => {
            var result = {};
            var {hasOwnProperty: hasOwnProperty} = Object.prototype;
            for (var i = 0; i < mapResults.length; i++) if (mapResults[i]) {
              var {key: key} = mapResults[i];
              var {val: val} = mapResults[i];
              hasOwnProperty.call(result, key) ? result[key].push(val) : result[key] = [ val ];
            }
            return callback(err, result);
          });
        }
        var groupByLimit$1 = awaitify(groupByLimit, 4);
        function groupBy(coll, iteratee, callback) {
          return groupByLimit$1(coll, Infinity, iteratee, callback);
        }
        function groupBySeries(coll, iteratee, callback) {
          return groupByLimit$1(coll, 1, iteratee, callback);
        }
        var log = consoleFunc("log");
        function mapValuesLimit(obj, limit, iteratee, callback) {
          callback = once(callback);
          var newObj = {};
          var _iteratee = wrapAsync(iteratee);
          return eachOfLimit(limit)(obj, (val, key, next) => {
            _iteratee(val, key, (err, result) => {
              if (err) return next(err);
              newObj[key] = result;
              next(err);
            });
          }, err => callback(err, newObj));
        }
        var mapValuesLimit$1 = awaitify(mapValuesLimit, 4);
        function mapValues(obj, iteratee, callback) {
          return mapValuesLimit$1(obj, Infinity, iteratee, callback);
        }
        function mapValuesSeries(obj, iteratee, callback) {
          return mapValuesLimit$1(obj, 1, iteratee, callback);
        }
        function memoize(fn, hasher = (v => v)) {
          var memo = Object.create(null);
          var queues = Object.create(null);
          var _fn = wrapAsync(fn);
          var memoized = initialParams((args, callback) => {
            var key = hasher(...args);
            if (key in memo) setImmediate$1(() => callback(null, ...memo[key])); else if (key in queues) queues[key].push(callback); else {
              queues[key] = [ callback ];
              _fn(...args, (err, ...resultArgs) => {
                err || (memo[key] = resultArgs);
                var q = queues[key];
                delete queues[key];
                for (var i = 0, l = q.length; i < l; i++) q[i](err, ...resultArgs);
              });
            }
          });
          memoized.memo = memo;
          memoized.unmemoized = fn;
          return memoized;
        }
        var _defer$1;
        _defer$1 = hasNextTick ? process.nextTick : hasSetImmediate ? setImmediate : fallback;
        var nextTick = wrap(_defer$1);
        var _parallel = awaitify((eachfn, tasks, callback) => {
          var results = isArrayLike(tasks) ? [] : {};
          eachfn(tasks, (task, key, taskCb) => {
            wrapAsync(task)((err, ...result) => {
              result.length < 2 && ([result] = result);
              results[key] = result;
              taskCb(err);
            });
          }, err => callback(err, results));
        }, 3);
        function parallel(tasks, callback) {
          return _parallel(eachOf$1, tasks, callback);
        }
        function parallelLimit(tasks, limit, callback) {
          return _parallel(eachOfLimit(limit), tasks, callback);
        }
        function queue$1(worker, concurrency) {
          var _worker = wrapAsync(worker);
          return queue((items, cb) => {
            _worker(items[0], cb);
          }, concurrency, 1);
        }
        class Heap {
          constructor() {
            this.heap = [];
            this.pushCount = Number.MIN_SAFE_INTEGER;
          }
          get length() {
            return this.heap.length;
          }
          empty() {
            this.heap = [];
            return this;
          }
          percUp(index) {
            let p;
            while (index > 0 && smaller(this.heap[index], this.heap[p = parent(index)])) {
              let t = this.heap[index];
              this.heap[index] = this.heap[p];
              this.heap[p] = t;
              index = p;
            }
          }
          percDown(index) {
            let l;
            while ((l = leftChi(index)) < this.heap.length) {
              l + 1 < this.heap.length && smaller(this.heap[l + 1], this.heap[l]) && (l += 1);
              if (smaller(this.heap[index], this.heap[l])) break;
              let t = this.heap[index];
              this.heap[index] = this.heap[l];
              this.heap[l] = t;
              index = l;
            }
          }
          push(node) {
            node.pushCount = ++this.pushCount;
            this.heap.push(node);
            this.percUp(this.heap.length - 1);
          }
          unshift(node) {
            return this.heap.push(node);
          }
          shift() {
            let [top] = this.heap;
            this.heap[0] = this.heap[this.heap.length - 1];
            this.heap.pop();
            this.percDown(0);
            return top;
          }
          toArray() {
            return [ ...this ];
          }
          * [Symbol.iterator]() {
            for (let i = 0; i < this.heap.length; i++) yield this.heap[i].data;
          }
          remove(testFn) {
            let j = 0;
            for (let i = 0; i < this.heap.length; i++) if (!testFn(this.heap[i])) {
              this.heap[j] = this.heap[i];
              j++;
            }
            this.heap.splice(j);
            for (let i = parent(this.heap.length - 1); i >= 0; i--) this.percDown(i);
            return this;
          }
        }
        function leftChi(i) {
          return 1 + (i << 1);
        }
        function parent(i) {
          return (i + 1 >> 1) - 1;
        }
        function smaller(x, y) {
          return x.priority !== y.priority ? x.priority < y.priority : x.pushCount < y.pushCount;
        }
        function priorityQueue(worker, concurrency) {
          var q = queue$1(worker, concurrency);
          var processingScheduled = false;
          q._tasks = new Heap();
          q.push = function(data, priority = 0, callback = (() => {})) {
            if ("function" !== typeof callback) throw new Error("task callback must be a function");
            q.started = true;
            Array.isArray(data) || (data = [ data ]);
            if (0 === data.length && q.idle()) return setImmediate$1(() => q.drain());
            for (var i = 0, l = data.length; i < l; i++) {
              var item = {
                data: data[i],
                priority: priority,
                callback: callback
              };
              q._tasks.push(item);
            }
            if (!processingScheduled) {
              processingScheduled = true;
              setImmediate$1(() => {
                processingScheduled = false;
                q.process();
              });
            }
          };
          delete q.unshift;
          return q;
        }
        function race(tasks, callback) {
          callback = once(callback);
          if (!Array.isArray(tasks)) return callback(new TypeError("First argument to race must be an array of functions"));
          if (!tasks.length) return callback();
          for (var i = 0, l = tasks.length; i < l; i++) wrapAsync(tasks[i])(callback);
        }
        var race$1 = awaitify(race, 2);
        function reduceRight(array, memo, iteratee, callback) {
          var reversed = [ ...array ].reverse();
          return reduce$1(reversed, memo, iteratee, callback);
        }
        function reflect(fn) {
          var _fn = wrapAsync(fn);
          return initialParams(function reflectOn(args, reflectCallback) {
            args.push((error, ...cbArgs) => {
              let retVal = {};
              error && (retVal.error = error);
              if (cbArgs.length > 0) {
                var value = cbArgs;
                cbArgs.length <= 1 && ([value] = cbArgs);
                retVal.value = value;
              }
              reflectCallback(null, retVal);
            });
            return _fn.apply(this, args);
          });
        }
        function reflectAll(tasks) {
          var results;
          if (Array.isArray(tasks)) results = tasks.map(reflect); else {
            results = {};
            Object.keys(tasks).forEach(key => {
              results[key] = reflect.call(this, tasks[key]);
            });
          }
          return results;
        }
        function reject(eachfn, arr, _iteratee, callback) {
          const iteratee = wrapAsync(_iteratee);
          return _filter(eachfn, arr, (value, cb) => {
            iteratee(value, (err, v) => {
              cb(err, !v);
            });
          }, callback);
        }
        function reject$1(coll, iteratee, callback) {
          return reject(eachOf$1, coll, iteratee, callback);
        }
        var reject$2 = awaitify(reject$1, 3);
        function rejectLimit(coll, limit, iteratee, callback) {
          return reject(eachOfLimit(limit), coll, iteratee, callback);
        }
        var rejectLimit$1 = awaitify(rejectLimit, 4);
        function rejectSeries(coll, iteratee, callback) {
          return reject(eachOfSeries$1, coll, iteratee, callback);
        }
        var rejectSeries$1 = awaitify(rejectSeries, 3);
        function constant$1(value) {
          return function() {
            return value;
          };
        }
        const DEFAULT_TIMES = 5;
        const DEFAULT_INTERVAL = 0;
        function retry(opts, task, callback) {
          var options = {
            times: DEFAULT_TIMES,
            intervalFunc: constant$1(DEFAULT_INTERVAL)
          };
          if (arguments.length < 3 && "function" === typeof opts) {
            callback = task || promiseCallback();
            task = opts;
          } else {
            parseTimes(options, opts);
            callback = callback || promiseCallback();
          }
          if ("function" !== typeof task) throw new Error("Invalid arguments for async.retry");
          var _task = wrapAsync(task);
          var attempt = 1;
          function retryAttempt() {
            _task((err, ...args) => {
              if (false === err) return;
              err && attempt++ < options.times && ("function" != typeof options.errorFilter || options.errorFilter(err)) ? setTimeout(retryAttempt, options.intervalFunc(attempt - 1)) : callback(err, ...args);
            });
          }
          retryAttempt();
          return callback[PROMISE_SYMBOL];
        }
        function parseTimes(acc, t) {
          if ("object" === typeof t) {
            acc.times = +t.times || DEFAULT_TIMES;
            acc.intervalFunc = "function" === typeof t.interval ? t.interval : constant$1(+t.interval || DEFAULT_INTERVAL);
            acc.errorFilter = t.errorFilter;
          } else {
            if ("number" !== typeof t && "string" !== typeof t) throw new Error("Invalid arguments for async.retry");
            acc.times = +t || DEFAULT_TIMES;
          }
        }
        function retryable(opts, task) {
          if (!task) {
            task = opts;
            opts = null;
          }
          let arity = opts && opts.arity || task.length;
          isAsync(task) && (arity += 1);
          var _task = wrapAsync(task);
          return initialParams((args, callback) => {
            if (args.length < arity - 1 || null == callback) {
              args.push(callback);
              callback = promiseCallback();
            }
            function taskFn(cb) {
              _task(...args, cb);
            }
            opts ? retry(opts, taskFn, callback) : retry(taskFn, callback);
            return callback[PROMISE_SYMBOL];
          });
        }
        function series(tasks, callback) {
          return _parallel(eachOfSeries$1, tasks, callback);
        }
        function some(coll, iteratee, callback) {
          return _createTester(Boolean, res => res)(eachOf$1, coll, iteratee, callback);
        }
        var some$1 = awaitify(some, 3);
        function someLimit(coll, limit, iteratee, callback) {
          return _createTester(Boolean, res => res)(eachOfLimit(limit), coll, iteratee, callback);
        }
        var someLimit$1 = awaitify(someLimit, 4);
        function someSeries(coll, iteratee, callback) {
          return _createTester(Boolean, res => res)(eachOfSeries$1, coll, iteratee, callback);
        }
        var someSeries$1 = awaitify(someSeries, 3);
        function sortBy(coll, iteratee, callback) {
          var _iteratee = wrapAsync(iteratee);
          return map$1(coll, (x, iterCb) => {
            _iteratee(x, (err, criteria) => {
              if (err) return iterCb(err);
              iterCb(err, {
                value: x,
                criteria: criteria
              });
            });
          }, (err, results) => {
            if (err) return callback(err);
            callback(null, results.sort(comparator).map(v => v.value));
          });
          function comparator(left, right) {
            var a = left.criteria, b = right.criteria;
            return a < b ? -1 : a > b ? 1 : 0;
          }
        }
        var sortBy$1 = awaitify(sortBy, 3);
        function timeout(asyncFn, milliseconds, info) {
          var fn = wrapAsync(asyncFn);
          return initialParams((args, callback) => {
            var timedOut = false;
            var timer;
            function timeoutCallback() {
              var name = asyncFn.name || "anonymous";
              var error = new Error('Callback function "' + name + '" timed out.');
              error.code = "ETIMEDOUT";
              info && (error.info = info);
              timedOut = true;
              callback(error);
            }
            args.push((...cbArgs) => {
              if (!timedOut) {
                callback(...cbArgs);
                clearTimeout(timer);
              }
            });
            timer = setTimeout(timeoutCallback, milliseconds);
            fn(...args);
          });
        }
        function range(size) {
          var result = Array(size);
          while (size--) result[size] = size;
          return result;
        }
        function timesLimit(count, limit, iteratee, callback) {
          var _iteratee = wrapAsync(iteratee);
          return mapLimit$1(range(count), limit, _iteratee, callback);
        }
        function times(n, iteratee, callback) {
          return timesLimit(n, Infinity, iteratee, callback);
        }
        function timesSeries(n, iteratee, callback) {
          return timesLimit(n, 1, iteratee, callback);
        }
        function transform(coll, accumulator, iteratee, callback) {
          if (arguments.length <= 3 && "function" === typeof accumulator) {
            callback = iteratee;
            iteratee = accumulator;
            accumulator = Array.isArray(coll) ? [] : {};
          }
          callback = once(callback || promiseCallback());
          var _iteratee = wrapAsync(iteratee);
          eachOf$1(coll, (v, k, cb) => {
            _iteratee(accumulator, v, k, cb);
          }, err => callback(err, accumulator));
          return callback[PROMISE_SYMBOL];
        }
        function tryEach(tasks, callback) {
          var error = null;
          var result;
          return eachSeries$1(tasks, (task, taskCb) => {
            wrapAsync(task)((err, ...args) => {
              if (false === err) return taskCb(err);
              args.length < 2 ? [result] = args : result = args;
              error = err;
              taskCb(err ? null : {});
            });
          }, () => callback(error, result));
        }
        var tryEach$1 = awaitify(tryEach);
        function unmemoize(fn) {
          return (...args) => (fn.unmemoized || fn)(...args);
        }
        function whilst(test, iteratee, callback) {
          callback = onlyOnce(callback);
          var _fn = wrapAsync(iteratee);
          var _test = wrapAsync(test);
          var results = [];
          function next(err, ...rest) {
            if (err) return callback(err);
            results = rest;
            if (false === err) return;
            _test(check);
          }
          function check(err, truth) {
            if (err) return callback(err);
            if (false === err) return;
            if (!truth) return callback(null, ...results);
            _fn(next);
          }
          return _test(check);
        }
        var whilst$1 = awaitify(whilst, 3);
        function until(test, iteratee, callback) {
          const _test = wrapAsync(test);
          return whilst$1(cb => _test((err, truth) => cb(err, !truth)), iteratee, callback);
        }
        function waterfall(tasks, callback) {
          callback = once(callback);
          if (!Array.isArray(tasks)) return callback(new Error("First argument to waterfall must be an array of functions"));
          if (!tasks.length) return callback();
          var taskIndex = 0;
          function nextTask(args) {
            var task = wrapAsync(tasks[taskIndex++]);
            task(...args, onlyOnce(next));
          }
          function next(err, ...args) {
            if (false === err) return;
            if (err || taskIndex === tasks.length) return callback(err, ...args);
            nextTask(args);
          }
          nextTask([]);
        }
        var waterfall$1 = awaitify(waterfall);
        var index = {
          apply: apply,
          applyEach: applyEach$1,
          applyEachSeries: applyEachSeries,
          asyncify: asyncify,
          auto: auto,
          autoInject: autoInject,
          cargo: cargo,
          cargoQueue: cargo$1,
          compose: compose,
          concat: concat$1,
          concatLimit: concatLimit$1,
          concatSeries: concatSeries$1,
          constant: constant,
          detect: detect$1,
          detectLimit: detectLimit$1,
          detectSeries: detectSeries$1,
          dir: dir,
          doUntil: doUntil,
          doWhilst: doWhilst$1,
          each: each,
          eachLimit: eachLimit$2,
          eachOf: eachOf$1,
          eachOfLimit: eachOfLimit$2,
          eachOfSeries: eachOfSeries$1,
          eachSeries: eachSeries$1,
          ensureAsync: ensureAsync,
          every: every$1,
          everyLimit: everyLimit$1,
          everySeries: everySeries$1,
          filter: filter$1,
          filterLimit: filterLimit$1,
          filterSeries: filterSeries$1,
          forever: forever$1,
          groupBy: groupBy,
          groupByLimit: groupByLimit$1,
          groupBySeries: groupBySeries,
          log: log,
          map: map$1,
          mapLimit: mapLimit$1,
          mapSeries: mapSeries$1,
          mapValues: mapValues,
          mapValuesLimit: mapValuesLimit$1,
          mapValuesSeries: mapValuesSeries,
          memoize: memoize,
          nextTick: nextTick,
          parallel: parallel,
          parallelLimit: parallelLimit,
          priorityQueue: priorityQueue,
          queue: queue$1,
          race: race$1,
          reduce: reduce$1,
          reduceRight: reduceRight,
          reflect: reflect,
          reflectAll: reflectAll,
          reject: reject$2,
          rejectLimit: rejectLimit$1,
          rejectSeries: rejectSeries$1,
          retry: retry,
          retryable: retryable,
          seq: seq,
          series: series,
          setImmediate: setImmediate$1,
          some: some$1,
          someLimit: someLimit$1,
          someSeries: someSeries$1,
          sortBy: sortBy$1,
          timeout: timeout,
          times: times,
          timesLimit: timesLimit,
          timesSeries: timesSeries,
          transform: transform,
          tryEach: tryEach$1,
          unmemoize: unmemoize,
          until: until,
          waterfall: waterfall$1,
          whilst: whilst$1,
          all: every$1,
          allLimit: everyLimit$1,
          allSeries: everySeries$1,
          any: some$1,
          anyLimit: someLimit$1,
          anySeries: someSeries$1,
          find: detect$1,
          findLimit: detectLimit$1,
          findSeries: detectSeries$1,
          flatMap: concat$1,
          flatMapLimit: concatLimit$1,
          flatMapSeries: concatSeries$1,
          forEach: each,
          forEachSeries: eachSeries$1,
          forEachLimit: eachLimit$2,
          forEachOf: eachOf$1,
          forEachOfSeries: eachOfSeries$1,
          forEachOfLimit: eachOfLimit$2,
          inject: reduce$1,
          foldl: reduce$1,
          foldr: reduceRight,
          select: filter$1,
          selectLimit: filterLimit$1,
          selectSeries: filterSeries$1,
          wrapSync: asyncify,
          during: whilst$1,
          doDuring: doWhilst$1
        };
        exports.default = index;
        exports.apply = apply;
        exports.applyEach = applyEach$1;
        exports.applyEachSeries = applyEachSeries;
        exports.asyncify = asyncify;
        exports.auto = auto;
        exports.autoInject = autoInject;
        exports.cargo = cargo;
        exports.cargoQueue = cargo$1;
        exports.compose = compose;
        exports.concat = concat$1;
        exports.concatLimit = concatLimit$1;
        exports.concatSeries = concatSeries$1;
        exports.constant = constant;
        exports.detect = detect$1;
        exports.detectLimit = detectLimit$1;
        exports.detectSeries = detectSeries$1;
        exports.dir = dir;
        exports.doUntil = doUntil;
        exports.doWhilst = doWhilst$1;
        exports.each = each;
        exports.eachLimit = eachLimit$2;
        exports.eachOf = eachOf$1;
        exports.eachOfLimit = eachOfLimit$2;
        exports.eachOfSeries = eachOfSeries$1;
        exports.eachSeries = eachSeries$1;
        exports.ensureAsync = ensureAsync;
        exports.every = every$1;
        exports.everyLimit = everyLimit$1;
        exports.everySeries = everySeries$1;
        exports.filter = filter$1;
        exports.filterLimit = filterLimit$1;
        exports.filterSeries = filterSeries$1;
        exports.forever = forever$1;
        exports.groupBy = groupBy;
        exports.groupByLimit = groupByLimit$1;
        exports.groupBySeries = groupBySeries;
        exports.log = log;
        exports.map = map$1;
        exports.mapLimit = mapLimit$1;
        exports.mapSeries = mapSeries$1;
        exports.mapValues = mapValues;
        exports.mapValuesLimit = mapValuesLimit$1;
        exports.mapValuesSeries = mapValuesSeries;
        exports.memoize = memoize;
        exports.nextTick = nextTick;
        exports.parallel = parallel;
        exports.parallelLimit = parallelLimit;
        exports.priorityQueue = priorityQueue;
        exports.queue = queue$1;
        exports.race = race$1;
        exports.reduce = reduce$1;
        exports.reduceRight = reduceRight;
        exports.reflect = reflect;
        exports.reflectAll = reflectAll;
        exports.reject = reject$2;
        exports.rejectLimit = rejectLimit$1;
        exports.rejectSeries = rejectSeries$1;
        exports.retry = retry;
        exports.retryable = retryable;
        exports.seq = seq;
        exports.series = series;
        exports.setImmediate = setImmediate$1;
        exports.some = some$1;
        exports.someLimit = someLimit$1;
        exports.someSeries = someSeries$1;
        exports.sortBy = sortBy$1;
        exports.timeout = timeout;
        exports.times = times;
        exports.timesLimit = timesLimit;
        exports.timesSeries = timesSeries;
        exports.transform = transform;
        exports.tryEach = tryEach$1;
        exports.unmemoize = unmemoize;
        exports.until = until;
        exports.waterfall = waterfall$1;
        exports.whilst = whilst$1;
        exports.all = every$1;
        exports.allLimit = everyLimit$1;
        exports.allSeries = everySeries$1;
        exports.any = some$1;
        exports.anyLimit = someLimit$1;
        exports.anySeries = someSeries$1;
        exports.find = detect$1;
        exports.findLimit = detectLimit$1;
        exports.findSeries = detectSeries$1;
        exports.flatMap = concat$1;
        exports.flatMapLimit = concatLimit$1;
        exports.flatMapSeries = concatSeries$1;
        exports.forEach = each;
        exports.forEachSeries = eachSeries$1;
        exports.forEachLimit = eachLimit$2;
        exports.forEachOf = eachOf$1;
        exports.forEachOfSeries = eachOfSeries$1;
        exports.forEachOfLimit = eachOfLimit$2;
        exports.inject = reduce$1;
        exports.foldl = reduce$1;
        exports.foldr = reduceRight;
        exports.select = filter$1;
        exports.selectLimit = filterLimit$1;
        exports.selectSeries = filterSeries$1;
        exports.wrapSync = asyncify;
        exports.during = whilst$1;
        exports.doDuring = doWhilst$1;
        Object.defineProperty(exports, "__esModule", {
          value: true
        });
      });
    }).call(this, require("_process"));
  }, {
    _process: 1
  } ],
  AnimHelper: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "d6ff4kVMSdOh7u6WwhErR6E", "AnimHelper");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        particleToPlay: cc.ParticleSystem,
        finishHandler: cc.Component.EventHandler,
        fireHandler: cc.Component.EventHandler
      },
      playParticle: function playParticle() {
        this.particleToPlay && this.particleToPlay.resetSystem();
      },
      fire: function fire() {
        cc.Component.EventHandler.emitEvents([ this.fireHandler ]);
      },
      finish: function finish() {
        cc.Component.EventHandler.emitEvents([ this.finishHandler ]);
      }
    });
    cc._RF.pop();
  }, {} ],
  BGPool: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "16ee7ZnsPBCT4NuNVNLJJz2", "BGPool");
    "use strict";
    var BGPool = cc.Class({
      name: "BGPool",
      properties: {
        bg: cc.SpriteFrame,
        bgcolor: cc.Color
      },
      ctor: function ctor() {
        this.idx = 0;
        this.initList = [];
        this.list = [];
      },
      init: function init() {
        var bgnode = cc.find("Canvas/root/bg");
        var com = bgnode.getComponent("cc.Sprite");
        com.spriteFrame = this.bg;
        bgnode.enabled = false;
        bgnode.enabled = true;
        var camnode = cc.find("Canvas/Main Camera");
        var cam = camnode.getComponent("cc.Camera");
        cam.backgroundColor = this.bgcolor;
        cc.log("bgc:" + this.bgcolor);
      }
    });
    module.exports = BGPool;
    cc._RF.pop();
  }, {} ],
  BackPackUI: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "96a192UeP9FDZ6jqVOqcUAs", "BackPackUI");
    "use strict";
    var HeroData = [];
    var HeroDataAll = [];
    var HeroDataCate = [];
    var cateValue = 999;
    var nftDir = 999;
    var pageSlots = 36;
    var page;
    var pageAll;
    cc.Class({
      extends: cc.Component,
      properties: {
        slotPrefab: {
          default: null,
          type: cc.Prefab
        },
        scrollView: {
          default: null,
          type: cc.ScrollView
        },
        btnPre: cc.Node,
        btnNext: cc.Node
      },
      init: function init(home) {
        this.home = home;
      },
      addHeroSlot: function addHeroSlot(i) {
        var heroSlot = cc.instantiate(this.slotPrefab);
        this.scrollView.content.addChild(heroSlot);
        heroSlot.getComponent("HeroSlot").updateHeroslot(HeroData[i].genes);
        heroSlot.getComponent("HeroSlot").refresh(HeroData[i]);
        var clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = this.node;
        clickEventHandler.component = "BackPackUI";
        clickEventHandler.handler = "onClickItem";
        clickEventHandler.customEventData = {
          index: i
        };
        var button = heroSlot.getComponent("HeroSlot").dbbutton;
        button.clickEvents.push(clickEventHandler);
        return heroSlot;
      },
      onClickItem: function onClickItem(event, customEventData) {
        var node = event.target;
        var index = customEventData.index;
        var heropanel = cc.find("Canvas/heroPanel");
        heropanel.getChildByName("hero01").getComponent("hero").updateHero(HeroData[index]);
        heropanel.getComponent("heroPanelUI").updatePanelDate(HeroData[index]);
        heropanel.getComponent("PanelUI").show();
        heropanel.getChildByName("btnPanDefi").active = false;
        heropanel.getChildByName("btnPanSwap").active = false;
        heropanel.getChildByName("btnPanMine").active = true;
        cc.find("Canvas/heroPanel/info/nftprice").active = true;
      },
      show: function show() {
        cc.find("Canvas/heroPanel").getComponent("PanelUI").hide();
        cc.find("Canvas/upgradePanel").getComponent("upgradePanel").hide();
        cc.find("Canvas/Shop").getComponent("ShopUI").hide();
        cc.find("Canvas/defiPanel").getComponent("DefiUI").hide();
        cc.find("Canvas/tipPanel").getComponent("TipPanelUI").hide();
        if (this.myheroSlots) for (var i = 0; i < this.myheroSlots.length; ++i) this.myheroSlots[i].destroy();
        var heroDataLocal = cc.sys.localStorage.getItem("HeroData");
        if (heroDataLocal) {
          HeroDataAll = JSON.parse(heroDataLocal);
          HeroDataCate = HeroDataAll;
        }
        page = 1;
        pageAll = parseInt(HeroDataCate.length / pageSlots) + 1;
        999 != cateValue && this.selectCate(this, cateValue);
        HeroData = HeroDataCate.slice(0, pageSlots);
        this.checkPage();
        this.myheroSlots = [];
        for (var _i = 0; _i < HeroData.length; ++_i) {
          var heroSlot = this.addHeroSlot(_i);
          this.myheroSlots.push(heroSlot);
        }
        this.node.active = true;
        this.node.emit("fade-in");
        this.home.toggleHomeBtns(false);
      },
      hide: function hide() {
        cc.find("Canvas/backPack/catePan/all").getComponent(cc.Toggle).isChecked = true;
        cc.find("Canvas/backPack/sortPan/nftup").getComponent(cc.Toggle).isChecked = true;
        if (this.myheroSlots) for (var i = 0; i < this.myheroSlots.length; ++i) this.myheroSlots[i].destroy();
        this.node.emit("fade-out");
        this.home.toggleHomeBtns(true);
      },
      checkPage: function checkPage() {
        this.btnPre.active = page > 1;
        this.btnNext.active = pageAll > page;
      },
      goToNext: function goToNext() {
        for (var i = 0; i < this.myheroSlots.length; ++i) this.myheroSlots[i].destroy();
        page += 1;
        HeroData = HeroDataCate.slice(pageSlots * (page - 1), pageSlots * page);
        this.checkPage();
        this.myheroSlots = [];
        console.log(HeroData);
        for (var _i2 = 0; _i2 < HeroData.length; ++_i2) {
          var heroSlot = this.addHeroSlot(_i2);
          this.myheroSlots.push(heroSlot);
        }
      },
      goToPre: function goToPre() {
        for (var i = 0; i < this.myheroSlots.length; ++i) this.myheroSlots[i].destroy();
        page -= 1;
        HeroData = HeroDataCate.slice(pageSlots * (page - 1), pageSlots * page);
        this.checkPage();
        this.myheroSlots = [];
        for (var _i3 = 0; _i3 < HeroData.length; ++_i3) {
          var heroSlot = this.addHeroSlot(_i3);
          this.myheroSlots.push(heroSlot);
        }
      },
      selectCate: function selectCate(event, cate) {
        if (cateValue == cate) return;
        cateValue = cate;
        for (var i = 0; i < this.myheroSlots.length; ++i) this.myheroSlots[i].destroy();
        HeroDataCate = 999 == cate ? HeroDataAll : HeroDataAll.filter(function(item) {
          return item.category == cate;
        });
        999 != nftDir && this.sortDate(this, nftDir);
        page = 1;
        pageAll = parseInt(HeroDataCate.length / pageSlots) + 1;
        HeroData = HeroDataCate.slice(0, pageSlots);
        this.checkPage();
        this.myheroSlots = [];
        for (var _i4 = 0; _i4 < HeroData.length; ++_i4) {
          var heroSlot = this.addHeroSlot(_i4);
          this.myheroSlots.push(heroSlot);
        }
      },
      sortDate: function sortDate(event, dir) {
        if (nftDir == dir) return;
        nftDir = dir;
        for (var i = 0; i < this.myheroSlots.length; ++i) this.myheroSlots[i].destroy();
        HeroDataCate = 1 == dir ? HeroDataCate.sort(function(x, y) {
          return parseFloat(x["nft_value"]) - parseFloat(y["nft_value"]);
        }) : HeroDataCate.sort(function(x, y) {
          return parseFloat(x["nft_value"]) - parseFloat(y["nft_value"]);
        }).reverse();
        page = 1;
        HeroData = HeroDataCate.slice(0, pageSlots);
        this.checkPage();
        this.myheroSlots = [];
        for (var _i5 = 0; _i5 < HeroData.length; ++_i5) {
          var heroSlot = this.addHeroSlot(_i5);
          this.myheroSlots.push(heroSlot);
        }
      }
    });
    cc._RF.pop();
  }, {} ],
  BossMng: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "af14cbY2OJFKb7mH92ncVxo", "BossMng");
    "use strict";
    var BossType = require("Types").BossType;
    var Spawn = require("Spawn");
    cc.Class({
      extends: cc.Component,
      properties: {
        demonSpawn: Spawn
      },
      init: function init(game) {
        this.game = game;
        this.waveMng = game.waveMng;
        this.bossIdx = 0;
      },
      startBoss: function startBoss() {
        this.bossIdx === BossType.Demon && this.waveMng.startBossSpawn(this.demonSpawn);
      },
      endBoss: function endBoss() {
        this.bossIdx++;
      }
    });
    cc._RF.pop();
  }, {
    Spawn: "Spawn",
    Types: "Types"
  } ],
  BossProgress: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "178aaufFWBMjKEMUnBNqyHl", "BossProgress");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        fxParticle: cc.ParticleSystem,
        anim: cc.Animation
      },
      init: function init(waveMng) {
        this.waveMng = waveMng;
      },
      show: function show() {
        this.node.active = true;
        this.anim.play("turn-red");
      },
      hide: function hide() {
        this.node.active = false;
      },
      showParticle: function showParticle() {
        this.fxParticle.resetSystem();
      }
    });
    cc._RF.pop();
  }, {} ],
  BoxUI: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "76f1exaIYhOronEFJ+o5VaQ", "BoxUI");
    "use strict";
    var HeroBoxData = [];
    var ChargeUI = require("ChargeUI");
    cc.Class({
      extends: cc.Component,
      properties: {
        anim: cc.Animation,
        figure: cc.Sprite,
        btnsNode: cc.Node,
        boxPrefab: {
          default: null,
          type: cc.Prefab
        },
        scrollView: {
          default: null,
          type: cc.ScrollView
        }
      },
      init: function init(home, panelType) {
        this.home = home;
        this.node.active = false;
        this.panelType = panelType;
        this.figure.node.runAction(cc.repeatForever(cc.sequence(cc.scaleTo(1, 1, .96), cc.scaleTo(1, 1, 1))));
      },
      addHeroBox: function addHeroBox(i) {
        var heroBox = cc.instantiate(this.boxPrefab);
        this.scrollView.content.addChild(heroBox);
        heroBox.getChildByName("id").getComponent(cc.Label).string = HeroBoxData[i].bid;
        var nowtime = Math.round(new Date().getTime() / 1e3);
        HeroBoxData[i].buytime + 8 > nowtime && (heroBox.color = cc.color(60, 60, 60));
        var clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = this.node;
        clickEventHandler.component = "BoxUI";
        clickEventHandler.handler = "onClickItem";
        clickEventHandler.customEventData = {
          index: i
        };
        var button = heroBox.getChildByName("btn_box").getComponent(cc.Button);
        button.clickEvents.push(clickEventHandler);
        return heroBox;
      },
      onClickItem: function onClickItem(event, customEventData) {
        var node = event.target;
        this.anim.play("box_open");
        var index = customEventData.index;
        cc.find("CCC").getComponent("CCCManager").openbox(this, index);
      },
      show: function show() {
        var boxDataLocal = cc.sys.localStorage.getItem("HeroBoxData");
        boxDataLocal && (HeroBoxData = JSON.parse(boxDataLocal));
        this.heroBoxs = [];
        for (var i = 0; i < HeroBoxData.length; ++i) {
          var heroBox = this.addHeroBox(i);
          this.heroBoxs.push(heroBox);
        }
        this.node.active = true;
        this.anim.play("box_intro");
        this.home.toggleHomeBtns(false);
        this.onFinishShow();
      },
      hide: function hide() {
        for (var i = 0; i < this.heroBoxs.length; ++i) this.heroBoxs[i].destroy();
        this.anim.play("box_outro");
        this.scheduleOnce(function() {
          this.anim.play("box_reset");
          this.onFinishHide();
        }.bind(this), .6);
        this.home.toggleHomeBtns(true);
      },
      onFinishShow: function onFinishShow() {
        this.home.curPanel = this.panelType;
      },
      onFinishHide: function onFinishHide() {
        this.node.active = false;
      }
    });
    cc._RF.pop();
  }, {
    ChargeUI: "ChargeUI"
  } ],
  ButtonScaler1: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "d7564Cn9+NOM6YfHHX7zsyO", "ButtonScaler1");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        pressedScale: 1,
        transDuration: 0
      },
      onLoad: function onLoad() {
        var self = this;
        self.initScale = this.node.scale;
        self.button = self.getComponent(cc.Button);
        self.scaleDownAction = cc.scaleTo(self.transDuration, self.pressedScale);
        self.scaleUpAction = cc.scaleTo(self.transDuration, self.initScale);
        function onTouchDown(event) {
          this.stopAllActions();
          this.runAction(self.scaleDownAction);
        }
        function onTouchUp(event) {
          this.stopAllActions();
          this.runAction(self.scaleUpAction);
        }
        this.node.on("touchstart", onTouchDown, this.node);
        this.node.on("touchend", onTouchUp, this.node);
        this.node.on("touchcancel", onTouchUp, this.node);
      }
    });
    cc._RF.pop();
  }, {} ],
  ButtonScaler: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "f5d10E3oQ9G/LlvNZly0S2Y", "ButtonScaler");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        pressedScale: 1,
        transDuration: 0
      },
      onLoad: function onLoad() {
        var self = this;
        self.initScale = this.node.scale;
        self.button = self.getComponent(cc.Button);
        self.scaleDownAction = cc.scaleTo(self.transDuration, self.pressedScale);
        self.scaleUpAction = cc.scaleTo(self.transDuration, self.initScale);
        function onTouchDown(event) {
          this.stopAllActions();
          this.runAction(self.scaleDownAction);
        }
        function onTouchUp(event) {
          this.stopAllActions();
          this.runAction(self.scaleUpAction);
        }
        this.node.on("touchstart", onTouchDown, this.node);
        this.node.on("touchend", onTouchUp, this.node);
        this.node.on("touchcancel", onTouchUp, this.node);
      }
    });
    cc._RF.pop();
  }, {} ],
  CCCManager: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "72e40WwrEpCnp9JEcfhaHos", "CCCManager");
    "use strict";
    function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
      try {
        var info = gen[key](arg);
        var value = info.value;
      } catch (error) {
        reject(error);
        return;
      }
      info.done ? resolve(value) : Promise.resolve(value).then(_next, _throw);
    }
    function _asyncToGenerator(fn) {
      return function() {
        var self = this, args = arguments;
        return new Promise(function(resolve, reject) {
          var gen = fn.apply(self, args);
          function _next(value) {
            asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
          }
          function _throw(err) {
            asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
          }
          _next(void 0);
        });
      };
    }
    ScatterJS.plugins(new ScatterEOS());
    var async = require("async");
    var network = {
      blockchain: "eos",
      protocol: "https",
      host: "eos.greymass.com",
      port: "443",
      chainId: "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906"
    };
    var dappName = "cryptocycle";
    var eos = null;
    var account;
    var scatter;
    var requiredFields;
    var eosOptions;
    var UserData = {
      name: "eosio.null",
      eosToken: "0.0000 EOS",
      cccToken: "0.0000 CCC"
    };
    var poolData = {
      poolToken: "0.0001",
      defiToken: "0.0001",
      configs: null,
      userList: null,
      poolConfig: null,
      wh_ratio: null,
      drtotalpower2: null,
      userpower2: null,
      bal_ratio: null
    };
    var Nodes = [ "eospush.tokenpocket.pro", "api.eosflare.io", "eos.greymass.com" ];
    var HeroboxSys = null;
    var BoxPrice = [];
    var HeroBoxData = [];
    var HeroData = [];
    var reserve0;
    var reserve1;
    var trade_fee = 90;
    var protocol_fee = 10;
    var swapPairData;
    var swapHeroData;
    var userDefiData;
    var cccDefiHero;
    var cccDefiWeapon;
    var MsgData;
    cc.Class({
      extends: cc.Component,
      properties: {
        upperNode: cc.Node,
        setPanelNode: cc.Node
      },
      onLoad: function onLoad() {
        cc.game.addPersistRootNode(this.node);
      },
      start: function start() {
        var networkLocal = cc.sys.localStorage.getItem("network");
        if (networkLocal) {
          network = JSON.parse(networkLocal);
          var nodeIndex = Nodes.indexOf(network.host) + 1;
          var togname = "toggle" + nodeIndex.toString();
          this.setPanelNode.getChildByName("content").getChildByName("item2").getChildByName("ToggleContainer").getChildByName(togname).getComponent(cc.Toggle).isChecked = true;
        }
        var userDataLocal = cc.sys.localStorage.getItem("userData");
        userDataLocal && (UserData = JSON.parse(userDataLocal));
        this.setUserData(UserData);
        var poolDataLocal = cc.sys.localStorage.getItem("poolData");
        poolDataLocal && (poolData = JSON.parse(poolDataLocal));
        var MsgDataLocal = cc.sys.localStorage.getItem("MsgData");
        if (MsgDataLocal) {
          MsgData = JSON.parse(MsgDataLocal);
          cc.find("CCC/upper/message").getComponent("message").setMsg(MsgData);
        }
        this.login();
        this.getChainData();
        this.getChainData3();
        this.getComponent("CCCManager").schedule(function() {
          this.getChainData();
        }, 8);
        this.getComponent("CCCManager").schedule(function() {
          this.getChainData2();
        }, 25);
        this.getComponent("CCCManager").schedule(function() {
          this.getChainData3();
        }, 55);
        this.getComponent("CCCManager").schedule(function() {
          cc.sys.localStorage.setItem("userData", JSON.stringify(UserData));
          cc.sys.localStorage.setItem("poolData", JSON.stringify(poolData));
        }, 25);
        this.getComponent("CCCManager").schedule(function() {
          this.setUserData(UserData);
        }, 10);
      },
      setUserData: function setUserData(userData) {
        this.upperNode.getChildByName("status_name").getChildByName("userName").getComponent(cc.Label).string = userData.name;
        this.upperNode.getChildByName("status_eos").getChildByName("num").getComponent(cc.Label).string = userData.eosToken;
        this.upperNode.getChildByName("status_ccc").getChildByName("num").getComponent(cc.Label).string = userData.cccToken;
        if (HeroboxSys) {
          var tipPan = cc.find("Canvas/tipPanel");
          0 == HeroboxSys.status && false == tipPan.active && tipPan.getComponent("TipPanelUI").show(this, 3);
          cc.find("Canvas/Home/btn_buybox1/title").getComponent(cc.Label).string = BoxPrice[0];
          cc.find("Canvas/Home/btn_buybox5/title").getComponent(cc.Label).string = BoxPrice[5];
          cc.find("Canvas/Home/home_box/id").getComponent(cc.Label).string = HeroboxSys.currentbid;
        }
      },
      login: function login() {
        ScatterJS.scatter.connect(dappName).then(function(connected) {
          if (!connected) {
            console.log("connect to scatter failed.");
            return;
          }
          console.log("connected to scatter.");
          scatter = ScatterJS.scatter;
          requiredFields = {
            accounts: [ network ]
          };
          scatter.getIdentity(requiredFields).then(function() {
            account = scatter.identity.accounts[0];
            UserData.name = account.name;
            eosOptions = {
              expireInSeconds: 60
            };
            eos = scatter.eos(network, Eos, eosOptions);
          })["catch"](function(error) {
            console.log("connect to scatter failed.");
            console.log(error);
          });
        });
      },
      getChainData: function getChainData() {
        this.handleGetBalance();
        this.handleGetBox();
        this.handleGetHero();
        this.scheduleOnce(function() {
          this.handleGetSwapHero();
          this.handleGetSwapPair();
        }.bind(this), 1);
      },
      getChainData2: function getChainData2() {
        this.handleGetDefiData();
        this.handleGetDefiNFT();
      },
      getChainData3: function getChainData3() {
        this.handleGetPoolBalance();
        this.handleGetPoolData();
        this.handleGetMsg();
      },
      getCurrencyBalance: function getCurrencyBalance(obj, callback) {
        var _this = this;
        return _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
          var params;
          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) switch (_context.prev = _context.next) {
             case 0:
              params = {
                code: obj.code,
                symbol: obj.coin,
                account: obj.account || UserData.name
              };
              if (eos) {
                _context.next = 4;
                break;
              }
              _context.next = 4;
              return _this.login();

             case 4:
              eos.getCurrencyBalance(params).then(function(results, error) {
                if (results) {
                  callback(results[0]);
                  return;
                }
              })["catch"](function(e) {});

             case 5:
             case "end":
              return _context.stop();
            }
          }, _callee);
        }))();
      },
      handleGetBalance: function handleGetBalance() {
        var _this2 = this;
        return _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
          var data, data1, data2;
          return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) switch (_context2.prev = _context2.next) {
             case 0:
              if (eos) {
                _context2.next = 4;
                break;
              }
              _context2.next = 3;
              return _this2.login();

             case 3:
              return _context2.abrupt("return");

             case 4:
              _context2.prev = 5;
              _context2.next = 8;
              return eos.getCurrencyBalance("eosio.token", UserData.name, "EOS");

             case 8:
              data = _context2.sent;
              UserData.eosToken = data[0] ? parseFloat(data[0]) : 0;
              _context2.next = 12;
              return eos.getCurrencyBalance("eoscccdotcom", UserData.name, "CCC");

             case 12:
              data1 = _context2.sent;
              UserData.cccToken = data1[0] ? parseFloat(data1[0]) : 0;
              _context2.next = 16;
              return eos.getTableRows({
                json: true,
                code: "herobox.ccc",
                scope: "herobox.ccc",
                table: "sys",
                limit: 1
              });

             case 16:
              data2 = _context2.sent;
              HeroboxSys = data2.rows[0];
              _this2.calBoxPrice();
              _context2.next = 24;
              break;

             case 21:
              _context2.prev = 21;
              _context2.t0 = _context2["catch"](5);
              console.log(_context2.t0);

             case 24:
             case "end":
              return _context2.stop();
            }
          }, _callee2, null, [ [ 5, 21 ] ]);
        }))();
      },
      handleGetPoolBalance: function handleGetPoolBalance() {
        var _this3 = this;
        return _asyncToGenerator(regeneratorRuntime.mark(function _callee3() {
          var data1, data2;
          return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) switch (_context3.prev = _context3.next) {
             case 0:
              if (eos) {
                _context3.next = 4;
                break;
              }
              _context3.next = 3;
              return _this3.login();

             case 3:
              return _context3.abrupt("return");

             case 4:
              _context3.prev = 5;
              _context3.next = 8;
              return eos.getCurrencyBalance("eoscccdotcom", "cccdefi.ccc", "CCC");

             case 8:
              data1 = _context3.sent;
              poolData.defiToken = data1[0] ? parseFloat(data1[0]) : 0;
              _context3.next = 12;
              return eos.getCurrencyBalance("eoscccdotcom", "cccpool.ccc", "CCC");

             case 12:
              data2 = _context3.sent;
              poolData.poolToken = data2[0] ? parseFloat(data2[0]) : 0;
              _context3.next = 19;
              break;

             case 16:
              _context3.prev = 16;
              _context3.t0 = _context3["catch"](5);
              console.log(_context3.t0);

             case 19:
             case "end":
              return _context3.stop();
            }
          }, _callee3, null, [ [ 5, 16 ] ]);
        }))();
      },
      handleGetPoolData: function handleGetPoolData() {
        var _this4 = this;
        return _asyncToGenerator(regeneratorRuntime.mark(function _callee4() {
          var data3, wpower, data4, data5;
          return regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) switch (_context4.prev = _context4.next) {
             case 0:
              if (eos) {
                _context4.next = 4;
                break;
              }
              _context4.next = 3;
              return _this4.login();

             case 3:
              return _context4.abrupt("return");

             case 4:
              _context4.prev = 5;
              _context4.next = 8;
              return eos.getTableRows({
                json: true,
                code: "cccdefi.ccc",
                scope: "cccdefi.ccc",
                table: "configs",
                limit: 1
              });

             case 8:
              data3 = _context4.sent;
              poolData.configs = data3.rows[0];
              wpower = poolData.configs.weaponspower;
              0 == wpower && (wpower = 1);
              if (poolData.configs) {
                poolData.wh_ratio = poolData.configs.herospower / (5 * wpower);
                poolData.drtotalpower2 = poolData.configs.herospower + poolData.configs.weaponspower * poolData.wh_ratio;
              }
              _context4.next = 17;
              return eos.getTableRows({
                json: true,
                code: "cccdefi.ccc",
                scope: "cccdefi.ccc",
                table: "lists",
                lower_bound: UserData.name,
                upper_bound: UserData.name,
                limit: 1
              });

             case 17:
              data4 = _context4.sent;
              poolData.userList = data4.rows[0];
              if (poolData.userList && poolData.wh_ratio) {
                poolData.userpower2 = poolData.userList.herospower + poolData.userList.weaponspower * poolData.wh_ratio;
                poolData.bal_ratio = poolData.userpower2 / poolData.drtotalpower2;
              }
              _context4.next = 23;
              return eos.getTableRows({
                json: true,
                code: "cccpool.ccc",
                scope: "cccpool.ccc",
                table: "config",
                limit: 1
              });

             case 23:
              data5 = _context4.sent;
              poolData.poolConfig = data5.rows[0];
              _context4.next = 30;
              break;

             case 27:
              _context4.prev = 27;
              _context4.t0 = _context4["catch"](5);
              console.log(_context4.t0);

             case 30:
             case "end":
              return _context4.stop();
            }
          }, _callee4, null, [ [ 5, 27 ] ]);
        }))();
      },
      handleGetBox: function handleGetBox() {
        var _this5 = this;
        return _asyncToGenerator(regeneratorRuntime.mark(function _callee5() {
          var data;
          return regeneratorRuntime.wrap(function _callee5$(_context5) {
            while (1) switch (_context5.prev = _context5.next) {
             case 0:
              if (eos) {
                _context5.next = 4;
                break;
              }
              _context5.next = 3;
              return _this5.login();

             case 3:
              return _context5.abrupt("return");

             case 4:
              _context5.prev = 5;
              _context5.next = 8;
              return eos.getTableRows({
                json: true,
                code: "herobox.ccc",
                scope: UserData.name,
                table: "boxs",
                limit: 100
              });

             case 8:
              data = _context5.sent;
              HeroBoxData = data.rows;
              cc.sys.localStorage.setItem("HeroBoxData", JSON.stringify(HeroBoxData));
              _context5.next = 16;
              break;

             case 13:
              _context5.prev = 13;
              _context5.t0 = _context5["catch"](5);
              console.log(_context5.t0);

             case 16:
             case "end":
              return _context5.stop();
            }
          }, _callee5, null, [ [ 5, 13 ] ]);
        }))();
      },
      handleGetNewHero: function handleGetNewHero() {
        var _this6 = this;
        return _asyncToGenerator(regeneratorRuntime.mark(function _callee6() {
          var data, newhero, swapPairDataLocal, heropanel;
          return regeneratorRuntime.wrap(function _callee6$(_context6) {
            while (1) switch (_context6.prev = _context6.next) {
             case 0:
              if (eos) {
                _context6.next = 4;
                break;
              }
              _context6.next = 3;
              return _this6.login();

             case 3:
              return _context6.abrupt("return");

             case 4:
              _context6.prev = 5;
              _context6.next = 8;
              return eos.getTableRows({
                json: true,
                code: "htoken.ccc",
                scope: "htoken.ccc",
                table: "tokens",
                index_position: "3",
                key_type: "i64",
                lower_bound: UserData.name,
                upper_bound: UserData.name,
                limit: 1,
                reverse: true,
                scopeToUint: false
              });

             case 8:
              data = _context6.sent;
              newhero = data.rows[0];
              swapPairDataLocal = cc.sys.localStorage.getItem("swapPairData");
              swapPairData = JSON.parse(swapPairDataLocal);
              null != swapPairData.reserve0 && (newhero.price = _this6.calSellHeroPrice(newhero.nft_value));
              heropanel = cc.find("Canvas/heroPanel");
              heropanel.getChildByName("hero01").getComponent("hero").updateHero(newhero);
              heropanel.getComponent("heroPanelUI").updatePanelDate(newhero);
              heropanel.getComponent("PanelUI").show();
              heropanel.getChildByName("btnPanSwap").active = false;
              heropanel.getChildByName("btnPanMine").active = true;
              _context6.next = 24;
              break;

             case 21:
              _context6.prev = 21;
              _context6.t0 = _context6["catch"](5);
              console.log(_context6.t0);

             case 24:
             case "end":
              return _context6.stop();
            }
          }, _callee6, null, [ [ 5, 21 ] ]);
        }))();
      },
      handleGetIDHero: function handleGetIDHero(id) {
        var _this7 = this;
        return _asyncToGenerator(regeneratorRuntime.mark(function _callee7() {
          var data, newhero, swapPairDataLocal, heropanel;
          return regeneratorRuntime.wrap(function _callee7$(_context7) {
            while (1) switch (_context7.prev = _context7.next) {
             case 0:
              if (eos) {
                _context7.next = 4;
                break;
              }
              _context7.next = 3;
              return _this7.login();

             case 3:
              return _context7.abrupt("return");

             case 4:
              _context7.prev = 5;
              _context7.next = 8;
              return eos.getTableRows({
                json: true,
                code: "htoken.ccc",
                scope: "htoken.ccc",
                table: "tokens",
                index_position: "1",
                lower_bound: id,
                upper_bound: id,
                limit: 1,
                reverse: true,
                scopeToUint: false
              });

             case 8:
              data = _context7.sent;
              newhero = data.rows[0];
              swapPairDataLocal = cc.sys.localStorage.getItem("swapPairData");
              swapPairData = JSON.parse(swapPairDataLocal);
              null != swapPairData.reserve0 && (newhero.price = _this7.calSellHeroPrice(newhero.nft_value));
              heropanel = cc.find("Canvas/heroPanel");
              heropanel.getChildByName("hero01").getComponent("hero").updateHero(newhero);
              heropanel.getComponent("heroPanelUI").updatePanelDate(newhero);
              heropanel.getComponent("PanelUI").show();
              _context7.next = 22;
              break;

             case 19:
              _context7.prev = 19;
              _context7.t0 = _context7["catch"](5);
              console.log(_context7.t0);

             case 22:
             case "end":
              return _context7.stop();
            }
          }, _callee7, null, [ [ 5, 19 ] ]);
        }))();
      },
      handleGetID: function handleGetID(type, id) {
        var _this8 = this;
        return _asyncToGenerator(regeneratorRuntime.mark(function _callee8() {
          var tokenContract, data, newdata;
          return regeneratorRuntime.wrap(function _callee8$(_context8) {
            while (1) switch (_context8.prev = _context8.next) {
             case 0:
              if (eos) {
                _context8.next = 4;
                break;
              }
              _context8.next = 3;
              return _this8.login();

             case 3:
              return _context8.abrupt("return");

             case 4:
              tokenContract = "htoken.ccc";
              "weapon" == type && (tokenContract = "wtoken.ccc");
              _context8.prev = 7;
              _context8.next = 10;
              return eos.getTableRows({
                json: true,
                code: tokenContract,
                scope: tokenContract,
                table: "tokens",
                index_position: "1",
                lower_bound: id,
                upper_bound: id,
                limit: 1,
                reverse: true,
                scopeToUint: false
              });

             case 10:
              data = _context8.sent;
              newdata = data.rows[0];
              console.log(newdata);
              return _context8.abrupt("return", newdata);

             case 16:
              _context8.prev = 16;
              _context8.t0 = _context8["catch"](7);
              console.log(_context8.t0);

             case 19:
             case "end":
              return _context8.stop();
            }
          }, _callee8, null, [ [ 7, 16 ] ]);
        }))();
      },
      handleGetHero: function handleGetHero() {
        var _this9 = this;
        return _asyncToGenerator(regeneratorRuntime.mark(function _callee9() {
          var data, swapPairDataLocal;
          return regeneratorRuntime.wrap(function _callee9$(_context9) {
            while (1) switch (_context9.prev = _context9.next) {
             case 0:
              if (eos) {
                _context9.next = 4;
                break;
              }
              _context9.next = 3;
              return _this9.login();

             case 3:
              return _context9.abrupt("return");

             case 4:
              _context9.prev = 5;
              _context9.next = 8;
              return eos.getTableRows({
                json: true,
                code: "htoken.ccc",
                scope: "htoken.ccc",
                table: "tokens",
                index_position: "3",
                key_type: "i64",
                lower_bound: UserData.name,
                upper_bound: UserData.name,
                limit: 1e3,
                reverse: false,
                scopeToUint: false
              });

             case 8:
              data = _context9.sent;
              HeroData = data.rows;
              swapPairDataLocal = cc.sys.localStorage.getItem("swapPairData");
              swapPairData = JSON.parse(swapPairDataLocal);
              null != swapPairData.reserve0 && HeroData.forEach(function(v) {
                v.price = _this9.calSellHeroPrice(v.nft_value);
              });
              cc.sys.localStorage.setItem("HeroData", JSON.stringify(HeroData));
              _context9.next = 19;
              break;

             case 16:
              _context9.prev = 16;
              _context9.t0 = _context9["catch"](5);
              console.log(_context9.t0);

             case 19:
             case "end":
              return _context9.stop();
            }
          }, _callee9, null, [ [ 5, 16 ] ]);
        }))();
      },
      handleGetSwapHero: function handleGetSwapHero() {
        var _this10 = this;
        return _asyncToGenerator(regeneratorRuntime.mark(function _callee10() {
          var data, swapPairDataLocal;
          return regeneratorRuntime.wrap(function _callee10$(_context10) {
            while (1) switch (_context10.prev = _context10.next) {
             case 0:
              if (eos) {
                _context10.next = 4;
                break;
              }
              _context10.next = 3;
              return _this10.login();

             case 3:
              return _context10.abrupt("return");

             case 4:
              _context10.prev = 5;
              _context10.next = 8;
              return eos.getTableRows({
                json: true,
                code: "htoken.ccc",
                scope: "htoken.ccc",
                table: "tokens",
                index_position: "3",
                key_type: "i64",
                lower_bound: "nftswap.ccc",
                upper_bound: "nftswap.ccc",
                limit: 1e3,
                reverse: false,
                scopeToUint: false
              });

             case 8:
              data = _context10.sent;
              swapHeroData = data.rows;
              swapPairDataLocal = cc.sys.localStorage.getItem("swapPairData");
              swapPairData = JSON.parse(swapPairDataLocal);
              null != swapPairData.reserve0 && swapHeroData.forEach(function(v) {
                v.price = _this10.calHeroPrice(v.nft_value);
              });
              cc.sys.localStorage.setItem("swapHeroData", JSON.stringify(swapHeroData));
              _context10.next = 19;
              break;

             case 16:
              _context10.prev = 16;
              _context10.t0 = _context10["catch"](5);
              console.log(_context10.t0);

             case 19:
             case "end":
              return _context10.stop();
            }
          }, _callee10, null, [ [ 5, 16 ] ]);
        }))();
      },
      handleGetSwapPair: function handleGetSwapPair() {
        var _this11 = this;
        return _asyncToGenerator(regeneratorRuntime.mark(function _callee11() {
          var data;
          return regeneratorRuntime.wrap(function _callee11$(_context11) {
            while (1) switch (_context11.prev = _context11.next) {
             case 0:
              if (eos) {
                _context11.next = 4;
                break;
              }
              _context11.next = 3;
              return _this11.login();

             case 3:
              return _context11.abrupt("return");

             case 4:
              _context11.prev = 5;
              _context11.next = 8;
              return eos.getTableRows({
                json: true,
                code: "nftswap.ccc",
                scope: "nftswap.ccc",
                table: "pairs",
                lower_bound: 1,
                upper_bound: 1,
                limit: 100
              });

             case 8:
              data = _context11.sent;
              swapPairData = data.rows[0];
              cc.sys.localStorage.setItem("swapPairData", JSON.stringify(swapPairData));
              _context11.next = 16;
              break;

             case 13:
              _context11.prev = 13;
              _context11.t0 = _context11["catch"](5);
              console.log(_context11.t0);

             case 16:
             case "end":
              return _context11.stop();
            }
          }, _callee11, null, [ [ 5, 13 ] ]);
        }))();
      },
      handleGetDefiData: function handleGetDefiData() {
        var _this12 = this;
        return _asyncToGenerator(regeneratorRuntime.mark(function _callee12() {
          var data, cccDefiHeroLocal, cccDefiWeaponLocal;
          return regeneratorRuntime.wrap(function _callee12$(_context12) {
            while (1) switch (_context12.prev = _context12.next) {
             case 0:
              if (eos) {
                _context12.next = 4;
                break;
              }
              _context12.next = 3;
              return _this12.login();

             case 3:
              return _context12.abrupt("return");

             case 4:
              _context12.prev = 5;
              _context12.next = 8;
              return eos.getTableRows({
                json: true,
                code: "cccdefi.ccc",
                scope: UserData.name,
                table: "stakes",
                limit: 3,
                reverse: false
              });

             case 8:
              data = _context12.sent;
              userDefiData = data.rows;
              cccDefiHeroLocal = cc.sys.localStorage.getItem("cccDefiHero");
              cccDefiWeaponLocal = cc.sys.localStorage.getItem("cccDefiWeapon");
              cccDefiHero = JSON.parse(cccDefiHeroLocal);
              cccDefiWeapon = JSON.parse(cccDefiWeaponLocal);
              userDefiData.forEach(function(v) {
                if (null != v.hid && 0 != v.hid) {
                  var hdata = cccDefiHero.filter(function(item) {
                    return item.id == v.hid;
                  });
                  null != hdata && (v.hero = hdata);
                } else if (null != v.wid && 0 != v.wid) {
                  var wdata = cccDefiWeapon.filter(function(item) {
                    return item.id == v.wid;
                  });
                  null != wdata && (v.weapon = wdata);
                }
              });
              cc.sys.localStorage.setItem("userDefiData", JSON.stringify(userDefiData));
              _context12.next = 21;
              break;

             case 18:
              _context12.prev = 18;
              _context12.t0 = _context12["catch"](5);
              console.log(_context12.t0);

             case 21:
             case "end":
              return _context12.stop();
            }
          }, _callee12, null, [ [ 5, 18 ] ]);
        }))();
      },
      handleGetDefiNFT: function handleGetDefiNFT() {
        var _this13 = this;
        return _asyncToGenerator(regeneratorRuntime.mark(function _callee13() {
          var data1, data2;
          return regeneratorRuntime.wrap(function _callee13$(_context13) {
            while (1) switch (_context13.prev = _context13.next) {
             case 0:
              if (eos) {
                _context13.next = 4;
                break;
              }
              _context13.next = 3;
              return _this13.login();

             case 3:
              return _context13.abrupt("return");

             case 4:
              _context13.prev = 5;
              _context13.next = 8;
              return eos.getTableRows({
                json: true,
                code: "htoken.ccc",
                scope: "htoken.ccc",
                table: "tokens",
                index_position: "3",
                key_type: "i64",
                lower_bound: "cccdefi.ccc",
                upper_bound: "cccdefi.ccc",
                limit: 1e3,
                reverse: false,
                scopeToUint: false
              });

             case 8:
              data1 = _context13.sent;
              _context13.next = 11;
              return eos.getTableRows({
                json: true,
                code: "wtoken.ccc",
                scope: "wtoken.ccc",
                table: "tokens",
                index_position: "3",
                key_type: "i64",
                lower_bound: "cccdefi.ccc",
                upper_bound: "cccdefi.ccc",
                limit: 1e3,
                reverse: false,
                scopeToUint: false
              });

             case 11:
              data2 = _context13.sent;
              cccDefiHero = data1.rows;
              cccDefiWeapon = data2.rows;
              cc.sys.localStorage.setItem("cccDefiHero", JSON.stringify(cccDefiHero));
              cc.sys.localStorage.setItem("cccDefiWeapon", JSON.stringify(cccDefiWeapon));
              _context13.next = 23;
              break;

             case 20:
              _context13.prev = 20;
              _context13.t0 = _context13["catch"](5);
              console.log(_context13.t0);

             case 23:
             case "end":
              return _context13.stop();
            }
          }, _callee13, null, [ [ 5, 20 ] ]);
        }))();
      },
      handleGetMsg: function handleGetMsg() {
        var _this14 = this;
        return _asyncToGenerator(regeneratorRuntime.mark(function _callee14() {
          var data, MsgDataChain, MsgDataNew, MsgDataLocal;
          return regeneratorRuntime.wrap(function _callee14$(_context14) {
            while (1) switch (_context14.prev = _context14.next) {
             case 0:
              if (eos) {
                _context14.next = 4;
                break;
              }
              _context14.next = 3;
              return _this14.login();

             case 3:
              return _context14.abrupt("return");

             case 4:
              _context14.prev = 5;
              _context14.next = 8;
              return eos.getTableRows({
                json: true,
                code: "cccdefi.ccc",
                scope: "cccdefi.ccc",
                table: "messages",
                limit: 10,
                reverse: true
              });

             case 8:
              data = _context14.sent;
              MsgDataChain = data.rows;
              MsgDataNew = [];
              MsgDataChain.forEach(function(v) {
                MsgDataNew.push(v.message);
              });
              console.log(MsgDataNew);
              MsgDataLocal = cc.sys.localStorage.getItem("MsgData");
              MsgData = JSON.parse(MsgDataLocal);
              if (MsgDataNew.length >= 2 && MsgDataNew != MsgData) {
                MsgData = MsgDataNew;
                cc.find("CCC/upper/message").getComponent("message").setMsg(MsgData);
                cc.sys.localStorage.setItem("MsgData", JSON.stringify(MsgData));
              }
              _context14.next = 21;
              break;

             case 18:
              _context14.prev = 18;
              _context14.t0 = _context14["catch"](5);
              console.log(_context14.t0);

             case 21:
             case "end":
              return _context14.stop();
            }
          }, _callee14, null, [ [ 5, 18 ] ]);
        }))();
      },
      calHeroPrice: function calHeroPrice(nftvalue) {
        var swapPairDataLocal = cc.sys.localStorage.getItem("swapPairData");
        swapPairData = JSON.parse(swapPairDataLocal);
        var reserve_in = parseFloat(swapPairData.reserve0) * Math.pow(10, 4);
        var reserve_out = parseFloat(swapPairData.reserve1) * Math.pow(10, 4);
        var amount_out = parseFloat(nftvalue) * Math.pow(10, 4);
        var numerator = reserve_in * amount_out;
        var denominator = reserve_out - amount_out;
        var amount_in_without_fee = numerator / denominator;
        var amount_in_with_fee = 1e4 * amount_in_without_fee / (1e4 - trade_fee);
        var amount_out_with_pro_fee = 1e4 * amount_in_with_fee / (1e4 - protocol_fee);
        var quantity_out = (amount_out_with_pro_fee / Math.pow(10, 4)).toFixed(4) + " EOS";
        return quantity_out;
      },
      calSellHeroPrice: function calSellHeroPrice(nftvalue) {
        var swapPairDataLocal = cc.sys.localStorage.getItem("swapPairData");
        swapPairData = JSON.parse(swapPairDataLocal);
        var reserve_in = parseFloat(swapPairData.reserve1) * Math.pow(10, 4);
        var reserve_out = parseFloat(swapPairData.reserve0) * Math.pow(10, 4);
        var amount_in = parseFloat(nftvalue) * Math.pow(10, 4);
        var numerator = amount_in * reserve_out;
        var denominator = reserve_in + amount_in;
        var amount_out_p1 = numerator / denominator;
        var amount_out_p2 = amount_out_p1 * (1e4 - trade_fee) / 1e4;
        var amount_out_with_pro_fee = amount_out_p2 * (1e4 - protocol_fee) / 1e4;
        var quantity_out = (amount_out_with_pro_fee / Math.pow(10, 4)).toFixed(4) + " EOS";
        return quantity_out;
      },
      calBoxPrice: function calBoxPrice() {
        if (HeroboxSys) {
          BoxPrice = [];
          if (HeroboxSys.currentbid < 5e3) BoxPrice = [ "5.0000 EOS", "5.0000 EOS", "5.0000 EOS", "5.0000 EOS", "5.0000 EOS", "25.0000 EOS" ]; else {
            var nowtime = Math.round(new Date().getTime() / 1e3);
            var jt = parseInt((nowtime - HeroboxSys.lasttime) / HeroboxSys.attime);
            var bp = parseFloat(HeroboxSys.price) - increase * jt / 1e4;
            var bp1 = bp < 5 ? 5 : bp;
            var bpAll = 0;
            for (var i = 0; i < 5; i++) {
              bpAll += bp1;
              var bps = formatnumber(bp1, 4) + " EOS";
              BoxPrice.push(bps);
              bp1 += increase / 1e4;
              if (4 == i) {
                var bpa = formatnumber(bpAll, 4) + " EOS";
                BoxPrice.push(bpa);
              }
            }
          }
        }
      },
      buybox: function buybox(num) {
        var _this15 = this;
        return _asyncToGenerator(regeneratorRuntime.mark(function _callee15() {
          var params, i, pa, result, tipPan;
          return regeneratorRuntime.wrap(function _callee15$(_context15) {
            while (1) switch (_context15.prev = _context15.next) {
             case 0:
              if (!(0 == BoxPrice.length)) {
                _context15.next = 2;
                break;
              }
              return _context15.abrupt("return");

             case 2:
              params = [];
              if (1 == num) params = [ {
                account: "eosio.token",
                name: "transfer",
                authorization: [ {
                  actor: UserData.name,
                  permission: "active"
                } ],
                data: {
                  from: UserData.name,
                  to: "herobox.ccc",
                  quantity: BoxPrice[0],
                  memo: ""
                }
              } ]; else for (i = 0; i < 5; i++) {
                pa = {
                  account: "eosio.token",
                  name: "transfer",
                  authorization: [ {
                    actor: UserData.name,
                    permission: "active"
                  } ],
                  data: {
                    from: UserData.name,
                    to: "herobox.ccc",
                    quantity: BoxPrice[i],
                    memo: ""
                  }
                };
                params.push(pa);
              }
              _context15.prev = 5;
              _context15.next = 8;
              return eos.transaction({
                actions: params
              });

             case 8:
              result = _context15.sent;
              _this15.handleGetBox();
              _this15.scheduleOnce(function() {
                1 == num ? cc.find("Canvas/Home").getComponent("HomeUI").buyboxAnim.play("home_buybox1") : cc.find("Canvas/Home").getComponent("HomeUI").buyboxAnim.play("home_buybox5");
              }.bind(_this15), .5);
              _this15.scheduleOnce(function() {
                cc.find("Canvas/Home").getComponent("HomeUI").menuAnim.play("menu_intro");
                cc.find("Canvas/Home").getComponent("HomeUI").boxtipNode = cc.find("Canvas/lower/main_btns/layout/btn_box/tip");
                cc.find("Canvas/Home").getComponent("HomeUI").boxtipNode.active = true;
              }.bind(_this15), 5.5);
              _context15.next = 20;
              break;

             case 14:
              _context15.prev = 14;
              _context15.t0 = _context15["catch"](5);
              tipPan = cc.find("Canvas/tipPanel");
              tipPan.getComponent("TipPanelUI").show(_this15, 4);
              cc.find("Canvas/tipPanel/error").getComponent(cc.Label).string = _context15.t0;
              _this15.scheduleOnce(function() {
                cc.find("Canvas/Home").getComponent("HomeUI").menuAnim.play("menu_intro");
                cc.find("Canvas/Home/buybox/glow").active = false;
              }.bind(_this15), 3.5);

             case 20:
             case "end":
              return _context15.stop();
            }
          }, _callee15, null, [ [ 5, 14 ] ]);
        }))();
      },
      openbox: function openbox(event, customEventData) {
        var _this16 = this;
        return _asyncToGenerator(regeneratorRuntime.mark(function _callee16() {
          var params, i, pa, result, boxui, _i, tipPan;
          return regeneratorRuntime.wrap(function _callee16$(_context16) {
            while (1) switch (_context16.prev = _context16.next) {
             case 0:
              if (!(0 == HeroBoxData.length)) {
                _context16.next = 2;
                break;
              }
              return _context16.abrupt("return");

             case 2:
              params = [];
              if (999 == customEventData) {
                cc.find("Canvas/Box").getComponent("BoxUI").anim.play("box_open");
                for (i = 0; i < HeroBoxData.length; i++) {
                  pa = {
                    account: "herobox.ccc",
                    name: "openbox",
                    authorization: [ {
                      actor: UserData.name,
                      permission: "active"
                    } ],
                    data: {
                      owner: UserData.name,
                      id: HeroBoxData[i].bid
                    }
                  };
                  params.push(pa);
                }
              } else params = [ {
                account: "herobox.ccc",
                name: "openbox",
                authorization: [ {
                  actor: UserData.name,
                  permission: "active"
                } ],
                data: {
                  owner: UserData.name,
                  id: HeroBoxData[customEventData].bid
                }
              } ];
              _context16.prev = 5;
              _context16.next = 8;
              return eos.transaction({
                actions: params
              });

             case 8:
              result = _context16.sent;
              cc.find("Canvas/lower/main_btns/layout/btn_box/tip").active = false;
              _this16.handleGetBox();
              _this16.scheduleOnce(function() {
                this.handleGetNewHero();
              }.bind(_this16), 1.5);
              boxui = cc.find("Canvas/Box").getComponent("BoxUI");
              if (999 == customEventData) for (_i = 0; _i < boxui.heroBoxs.length; ++_i) boxui.heroBoxs[_i].destroy(); else boxui.heroBoxs[customEventData].destroy();
              _this16.scheduleOnce(function() {
                cc.find("Canvas/Box").getComponent("BoxUI").anim.play("box_intro");
              }.bind(_this16), 5.5);
              _context16.next = 23;
              break;

             case 17:
              _context16.prev = 17;
              _context16.t0 = _context16["catch"](5);
              tipPan = cc.find("Canvas/tipPanel");
              tipPan.getComponent("TipPanelUI").show(_this16, 4);
              cc.find("Canvas/tipPanel/error").getComponent(cc.Label).string = _context16.t0;
              _this16.scheduleOnce(function() {
                cc.find("Canvas/Box").getComponent("BoxUI").anim.play("box_intro");
                cc.find("Canvas/Box/fx/fx1").active = false;
                cc.find("Canvas/Box/fx/fx2").active = false;
              }.bind(_this16), 3.5);

             case 23:
             case "end":
              return _context16.stop();
            }
          }, _callee16, null, [ [ 5, 17 ] ]);
        }))();
      },
      buyHero: function buyHero(pid, tid, price) {
        var _this17 = this;
        return _asyncToGenerator(regeneratorRuntime.mark(function _callee17() {
          var params, result, tipPan;
          return regeneratorRuntime.wrap(function _callee17$(_context17) {
            while (1) switch (_context17.prev = _context17.next) {
             case 0:
              params = [ {
                account: "eosio.token",
                name: "transfer",
                authorization: [ {
                  actor: UserData.name,
                  permission: "active"
                } ],
                data: {
                  from: UserData.name,
                  to: "nftswap.ccc",
                  quantity: price,
                  memo: "buy:" + pid + ":" + tid
                }
              } ];
              _context17.prev = 1;
              _context17.next = 4;
              return eos.transaction({
                actions: params
              });

             case 4:
              result = _context17.sent;
              _this17.handleGetSwapPair();
              _this17.scheduleOnce(function() {
                cc.find("Canvas/backPack").getComponent("BackPackUI").hide();
                cc.find("Canvas/heroPanel").getComponent("PanelUI").hide();
                cc.find("Canvas/upgradePanel").getComponent("upgradePanel").hide();
                cc.find("Canvas/Shop").getComponent("ShopUI").hide();
                cc.find("Canvas/heroPanel/fx/bg_eff3").active = true;
                cc.find("Canvas/heroPanel/success").active = true;
                cc.find("Canvas/heroPanel/info/nftprice").active = true;
                var heropanel = cc.find("Canvas/heroPanel");
                heropanel.getChildByName("btnPanDefi").active = false;
                heropanel.getChildByName("btnPanSwap").active = false;
                heropanel.getChildByName("btnPanMine").active = true;
                this.handleGetIDHero(tid);
              }.bind(_this17), 2);
              _context17.next = 15;
              break;

             case 9:
              _context17.prev = 9;
              _context17.t0 = _context17["catch"](1);
              console.log(_context17.t0);
              tipPan = cc.find("Canvas/tipPanel");
              tipPan.getComponent("TipPanelUI").show(_this17, 4);
              cc.find("Canvas/tipPanel/error").getComponent(cc.Label).string = _context17.t0;

             case 15:
             case "end":
              return _context17.stop();
            }
          }, _callee17, null, [ [ 1, 9 ] ]);
        }))();
      },
      sellHero: function sellHero(pid, tid, price) {
        var _this18 = this;
        return _asyncToGenerator(regeneratorRuntime.mark(function _callee18() {
          var params, result, tipPan;
          return regeneratorRuntime.wrap(function _callee18$(_context18) {
            while (1) switch (_context18.prev = _context18.next) {
             case 0:
              params = [ {
                account: "htoken.ccc",
                name: "transfer",
                authorization: [ {
                  actor: UserData.name,
                  permission: "active"
                } ],
                data: {
                  id: tid,
                  from: UserData.name,
                  to: "nftswap.ccc",
                  memo: "sell:" + pid + ":" + price
                }
              } ];
              _context18.prev = 1;
              _context18.next = 4;
              return eos.transaction({
                actions: params
              });

             case 4:
              result = _context18.sent;
              _this18.handleGetSwapPair();
              cc.find("Canvas/backPack").getComponent("BackPackUI").hide();
              cc.find("Canvas/heroPanel").getComponent("PanelUI").hide();
              cc.find("Canvas/upgradePanel").getComponent("upgradePanel").hide();
              cc.find("Canvas/Shop").getComponent("ShopUI").hide();
              tipPan = cc.find("Canvas/tipPanel");
              tipPan.getComponent("TipPanelUI").show(_this18, 5);
              _context18.next = 20;
              break;

             case 14:
              _context18.prev = 14;
              _context18.t0 = _context18["catch"](1);
              console.log(_context18.t0);
              tipPan = cc.find("Canvas/tipPanel");
              tipPan.getComponent("TipPanelUI").show(_this18, 4);
              cc.find("Canvas/tipPanel/error").getComponent(cc.Label).string = _context18.t0;

             case 20:
             case "end":
              return _context18.stop();
            }
          }, _callee18, null, [ [ 1, 14 ] ]);
        }))();
      },
      upgrade: function upgrade(tokencontract, mid, ids) {
        var _this19 = this;
        return _asyncToGenerator(regeneratorRuntime.mark(function _callee19() {
          var params, result, tipPan;
          return regeneratorRuntime.wrap(function _callee19$(_context19) {
            while (1) switch (_context19.prev = _context19.next) {
             case 0:
              params = [ {
                account: tokencontract,
                name: "upgrade",
                authorization: [ {
                  actor: UserData.name,
                  permission: "active"
                } ],
                data: {
                  user: UserData.name,
                  mid: mid,
                  ids: ids
                }
              } ];
              _context19.prev = 1;
              _context19.next = 4;
              return eos.transaction({
                actions: params
              });

             case 4:
              result = _context19.sent;
              console.log(result);
              cc.find("Canvas/heroPanel").getComponent("PanelUI").hide();
              cc.find("Canvas/upgradePanel").getComponent("upgradePanel").hide();
              cc.find("Canvas/backPack").getComponent("BackPackUI").hide();
              cc.find("Canvas/heroPanel/fx/bg_eff1").active = true;
              cc.find("Canvas/heroPanel/success").active = true;
              cc.find("Canvas/heroPanel/info/nftprice").active = true;
              _this19.scheduleOnce(function() {
                this.handleGetIDHero(mid);
              }.bind(_this19), .5);
              _context19.next = 21;
              break;

             case 15:
              _context19.prev = 15;
              _context19.t0 = _context19["catch"](1);
              console.log(_context19.t0);
              tipPan = cc.find("Canvas/tipPanel");
              tipPan.getComponent("TipPanelUI").show(_this19, 4);
              cc.find("Canvas/tipPanel/error").getComponent(cc.Label).string = _context19.t0;

             case 21:
             case "end":
              return _context19.stop();
            }
          }, _callee19, null, [ [ 1, 15 ] ]);
        }))();
      },
      merge: function merge(tokencontract, ids) {
        var _this20 = this;
        return _asyncToGenerator(regeneratorRuntime.mark(function _callee20() {
          var params, result, tipPan;
          return regeneratorRuntime.wrap(function _callee20$(_context20) {
            while (1) switch (_context20.prev = _context20.next) {
             case 0:
              params = [ {
                account: tokencontract,
                name: "merge",
                authorization: [ {
                  actor: UserData.name,
                  permission: "active"
                } ],
                data: {
                  user: UserData.name,
                  ids: ids
                }
              } ];
              _context20.prev = 1;
              _context20.next = 4;
              return eos.transaction({
                actions: params
              });

             case 4:
              result = _context20.sent;
              _this20.handleGetBox();
              _this20.scheduleOnce(function() {
                cc.find("Canvas/Home").getComponent("HomeUI").buyboxAnim.play("home_buybox1");
              }.bind(_this20), .5);
              _this20.scheduleOnce(function() {
                cc.find("Canvas/Home").getComponent("HomeUI").menuAnim.play("menu_intro");
                cc.find("Canvas/Home").getComponent("HomeUI").boxtipNode = cc.find("Canvas/lower/main_btns/layout/btn_box/tip");
                cc.find("Canvas/Home").getComponent("HomeUI").boxtipNode.active = true;
              }.bind(_this20), 5.5);
              _context20.next = 16;
              break;

             case 10:
              _context20.prev = 10;
              _context20.t0 = _context20["catch"](1);
              tipPan = cc.find("Canvas/tipPanel");
              tipPan.getComponent("TipPanelUI").show(_this20, 4);
              cc.find("Canvas/tipPanel/error").getComponent(cc.Label).string = _context20.t0;
              _this20.scheduleOnce(function() {
                cc.find("Canvas/Home").getComponent("HomeUI").menuAnim.play("menu_intro");
                cc.find("Canvas/Home/buybox/glow").active = false;
              }.bind(_this20), 3.5);

             case 16:
             case "end":
              return _context20.stop();
            }
          }, _callee20, null, [ [ 1, 10 ] ]);
        }))();
      },
      claimDefi: function claimDefi() {
        var _this21 = this;
        return _asyncToGenerator(regeneratorRuntime.mark(function _callee21() {
          var params, result, currenttime, tipPan;
          return regeneratorRuntime.wrap(function _callee21$(_context21) {
            while (1) switch (_context21.prev = _context21.next) {
             case 0:
              params = [ {
                account: "cccpool.ccc",
                name: "mine",
                authorization: [ {
                  actor: UserData.name,
                  permission: "active"
                } ],
                data: {
                  user: UserData.name
                }
              }, {
                account: "cccdefi.ccc",
                name: "claim",
                authorization: [ {
                  actor: UserData.name,
                  permission: "active"
                } ],
                data: {
                  user: UserData.name
                }
              } ];
              _context21.prev = 1;
              _context21.next = 4;
              return eos.transaction({
                actions: params
              });

             case 4:
              result = _context21.sent;
              currenttime = Date.parse(new Date()) / 1e3;
              poolData.userList.lasttime = currenttime;
              cc.sys.localStorage.setItem("poolData", JSON.stringify(poolData));
              cc.find("Canvas/backPack").getComponent("BackPackUI").hide();
              cc.find("Canvas/heroPanel").getComponent("PanelUI").hide();
              cc.find("Canvas/upgradePanel").getComponent("upgradePanel").hide();
              cc.find("Canvas/Shop").getComponent("ShopUI").hide();
              cc.find("Canvas/defiPanel").getComponent("DefiUI").hide();
              tipPan = cc.find("Canvas/tipPanel");
              tipPan.getComponent("TipPanelUI").show(_this21, 6);
              _context21.next = 23;
              break;

             case 17:
              _context21.prev = 17;
              _context21.t0 = _context21["catch"](1);
              console.log(_context21.t0);
              tipPan = cc.find("Canvas/tipPanel");
              tipPan.getComponent("TipPanelUI").show(_this21, 4);
              cc.find("Canvas/tipPanel/error").getComponent(cc.Label).string = _context21.t0;

             case 23:
             case "end":
              return _context21.stop();
            }
          }, _callee21, null, [ [ 1, 17 ] ]);
        }))();
      },
      stakeHero: function stakeHero(tid) {
        var _this22 = this;
        return _asyncToGenerator(regeneratorRuntime.mark(function _callee22() {
          var slotLocal, params, result, currenttime, hIndex, slotHero, newSlot, tipPan;
          return regeneratorRuntime.wrap(function _callee22$(_context22) {
            while (1) switch (_context22.prev = _context22.next) {
             case 0:
              slotLocal = cc.sys.localStorage.getItem("curSlot");
              params = [ {
                account: "htoken.ccc",
                name: "transfer",
                authorization: [ {
                  actor: UserData.name,
                  permission: "active"
                } ],
                data: {
                  id: tid,
                  from: UserData.name,
                  to: "cccdefi.ccc",
                  memo: "stake:" + slotLocal
                }
              } ];
              _context22.prev = 2;
              _context22.next = 5;
              return eos.transaction({
                actions: params
              });

             case 5:
              result = _context22.sent;
              currenttime = Date.parse(new Date()) / 1e3;
              poolData.userList.lasttime = currenttime;
              cc.sys.localStorage.setItem("poolData", JSON.stringify(poolData));
              hIndex = HeroData.findIndex(function(n) {
                return n.id === tid;
              });
              slotHero = HeroData.splice(hIndex, 1);
              cccDefiHero.push(slotHero);
              newSlot = {
                slot: slotLocal,
                hid: tid,
                wid: 0,
                hero: slotHero,
                weapon: null
              };
              userDefiData.push(newSlot);
              cc.sys.localStorage.setItem("HeroData", JSON.stringify(HeroData));
              cc.sys.localStorage.setItem("userDefiData", JSON.stringify(userDefiData));
              cc.sys.localStorage.setItem("cccDefiHero", JSON.stringify(cccDefiHero));
              cc.find("Canvas/backPack").getComponent("BackPackUI").hide();
              cc.find("Canvas/heroPanel").getComponent("PanelUI").hide();
              cc.find("Canvas/upgradePanel").getComponent("upgradePanel").hide();
              cc.find("Canvas/Shop").getComponent("ShopUI").hide();
              cc.find("Canvas/defiPanel").getComponent("DefiUI").hide();
              tipPan = cc.find("Canvas/tipPanel");
              tipPan.getComponent("TipPanelUI").show(_this22, 8);
              _context22.next = 32;
              break;

             case 26:
              _context22.prev = 26;
              _context22.t0 = _context22["catch"](2);
              console.log(_context22.t0);
              tipPan = cc.find("Canvas/tipPanel");
              tipPan.getComponent("TipPanelUI").show(_this22, 4);
              cc.find("Canvas/tipPanel/error").getComponent(cc.Label).string = _context22.t0;

             case 32:
             case "end":
              return _context22.stop();
            }
          }, _callee22, null, [ [ 2, 26 ] ]);
        }))();
      },
      unstakeHero: function unstakeHero(slot) {
        var _this23 = this;
        return _asyncToGenerator(regeneratorRuntime.mark(function _callee23() {
          var params, result, currenttime, hIndex, slotHero, tipPan;
          return regeneratorRuntime.wrap(function _callee23$(_context23) {
            while (1) switch (_context23.prev = _context23.next) {
             case 0:
              params = [ {
                account: "cccdefi.ccc",
                name: "unstake",
                authorization: [ {
                  actor: UserData.name,
                  permission: "active"
                } ],
                data: {
                  user: UserData.name,
                  slot: slot
                }
              } ];
              _context23.prev = 1;
              _context23.next = 4;
              return eos.transaction({
                actions: params
              });

             case 4:
              result = _context23.sent;
              currenttime = Date.parse(new Date()) / 1e3;
              poolData.userList.lasttime = currenttime;
              cc.sys.localStorage.setItem("poolData", JSON.stringify(poolData));
              hIndex = userDefiData.findIndex(function(n) {
                return n.slot === slot;
              });
              console.log("userDefiData:" + userDefiData);
              console.log("hIndex:" + hIndex);
              slotHero = userDefiData.splice(hIndex, 1);
              console.log("slotHero:" + slotHero);
              HeroData.push(slotHero.hero);
              console.log("HeroData:" + HeroData);
              cc.sys.localStorage.setItem("HeroData", JSON.stringify(HeroData));
              cc.sys.localStorage.setItem("userDefiData", JSON.stringify(userDefiData));
              cc.find("Canvas/backPack").getComponent("BackPackUI").hide();
              cc.find("Canvas/heroPanel").getComponent("PanelUI").hide();
              cc.find("Canvas/upgradePanel").getComponent("upgradePanel").hide();
              cc.find("Canvas/Shop").getComponent("ShopUI").hide();
              cc.find("Canvas/defiPanel").getComponent("DefiUI").hide();
              tipPan = cc.find("Canvas/tipPanel");
              tipPan.getComponent("TipPanelUI").show(_this23, 7);
              _context23.next = 32;
              break;

             case 26:
              _context23.prev = 26;
              _context23.t0 = _context23["catch"](1);
              console.log(_context23.t0);
              tipPan = cc.find("Canvas/tipPanel");
              tipPan.getComponent("TipPanelUI").show(_this23, 4);
              cc.find("Canvas/tipPanel/error").getComponent(cc.Label).string = _context23.t0;

             case 32:
             case "end":
              return _context23.stop();
            }
          }, _callee23, null, [ [ 1, 26 ] ]);
        }))();
      },
      changeNode: function changeNode(event, customEventData) {
        if (network.host === Nodes[parseInt(customEventData)]) return;
        network.host = Nodes[parseInt(customEventData)];
        cc.sys.localStorage.setItem("network", JSON.stringify(network));
      },
      formatnumber: function formatnumber(value, num) {
        var a, b, c, i;
        a = value.toString();
        b = a.indexOf(".");
        c = a.length;
        if (0 == num) -1 != b && (a = a.substring(0, b)); else if (-1 == b) {
          a += ".";
          for (i = 1; i <= num; i++) a += "0";
        } else {
          a = a.substring(0, b + num + 1);
          for (i = c; i <= b + num; i++) a += "0";
        }
        return a;
      },
      update: function update(dt) {}
    });
    cc._RF.pop();
  }, {
    async: 2
  } ],
  ChargeUI: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "11f1epEd5FProshh8dSXgPW", "ChargeUI");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {},
      init: function init(home, parentBtns) {
        this.home = home;
        this.parentBtns = parentBtns;
      },
      show: function show() {
        this.node.active = true;
        this.node.emit("fade-in");
        this.home.toggleHomeBtns(false);
        cc.director.getScheduler().pauseTarget(this.parentBtns);
      },
      hide: function hide() {
        this.node.emit("fade-out");
        this.home.toggleHomeBtns(true);
        cc.director.getScheduler().resumeTarget(this.parentBtns);
      }
    });
    cc._RF.pop();
  }, {} ],
  ComboDisplay: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "8eb3c3ywppFI6IWH3Np7yc9", "ComboDisplay");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        labelCombo: cc.Label,
        spFlare: cc.Sprite,
        anim: cc.Animation,
        comboColors: [ cc.Color ],
        showDuration: 0
      },
      init: function init() {
        this.comboCount = 0;
        this.node.active = false;
        this.showTimer = 0;
      },
      playCombo: function playCombo() {
        this.comboCount++;
        this.node.active = true;
        var colorIdx = Math.min(Math.floor(this.comboCount / 10), this.comboColors.length - 1);
        this.spFlare.node.color = this.comboColors[colorIdx];
        this.labelCombo.node.color = this.comboColors[colorIdx];
        this.labelCombo.string = this.comboCount;
        this.anim.play("combo-pop");
        this.showTimer = 0;
      },
      hide: function hide() {
        this.comboCount = 0;
        this.node.active = false;
      },
      update: function update(dt) {
        if (!this.node.active) return;
        this.showTimer += dt;
        this.showTimer >= this.showDuration && this.hide();
      }
    });
    cc._RF.pop();
  }, {} ],
  DeathUI: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "0966f3/svtKzIRd+HwG3Kyd", "DeathUI");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {},
      init: function init(game) {
        this.game = game;
        this.hide();
      },
      show: function show() {
        this.node.setPosition(0, 0);
      },
      hide: function hide() {
        this.node.x = 3e3;
      },
      revive: function revive() {
        this.game.revive();
      },
      gameover: function gameover() {
        this.game.gameOver();
      }
    });
    cc._RF.pop();
  }, {} ],
  DefiUI: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "8a2ce8nNyRLKJ17XT6M4WcP", "DefiUI");
    "use strict";
    var HeroData = [];
    var HeroDataAll = [];
    var HeroDataCate = [];
    var cateValue = 999;
    var nftDir = 999;
    var pageSlots = 36;
    var page;
    var pageAll;
    var userDefiData = [];
    var poolData;
    cc.Class({
      extends: cc.Component,
      properties: {
        slotPrefab: {
          default: null,
          type: cc.Prefab
        },
        slot00: cc.Node,
        slot01: cc.Node,
        slot02: cc.Node
      },
      init: function init(home) {
        this.home = home;
      },
      addHeroSlot: function addHeroSlot(i) {
        var heroSlot = cc.instantiate(this.slotPrefab);
        var slotNum = userDefiData[i].slot;
        0 == slotNum ? this.slot00.addChild(heroSlot) : 1 == slotNum ? this.slot01.addChild(heroSlot) : 2 == slotNum && this.slot02.addChild(heroSlot);
        heroSlot.getComponent("HeroSlot").updateHeroslot(userDefiData[i].hero[0].genes);
        heroSlot.getComponent("HeroSlot").refresh(userDefiData[i].hero[0]);
        var clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = this.node;
        clickEventHandler.component = "DefiUI";
        clickEventHandler.handler = "onClickItem";
        clickEventHandler.customEventData = {
          index: i,
          slot: slotNum
        };
        var button = heroSlot.getComponent("HeroSlot").dbbutton;
        button.clickEvents.push(clickEventHandler);
        return heroSlot;
      },
      onClickItem: function onClickItem(event, customEventData) {
        var node = event.target;
        var index = customEventData.index;
        var slot = customEventData.slot;
        var heropanel = cc.find("Canvas/heroPanel");
        heropanel.getChildByName("hero01").getComponent("hero").updateHero(userDefiData[index].hero[0]);
        heropanel.getComponent("heroPanelUI").setSlot(userDefiData[index].slot);
        heropanel.getComponent("heroPanelUI").updatePanelDate(userDefiData[index].hero[0]);
        heropanel.getComponent("PanelUI").show();
        heropanel.getChildByName("btnPanDefi").active = true;
        heropanel.getChildByName("btnPanSwap").active = false;
        heropanel.getChildByName("btnPanMine").active = false;
        cc.find("Canvas/heroPanel/info/nftprice").active = false;
      },
      addSlot: function addSlot(event, slot) {
        cc.sys.localStorage.setItem("curSlot", slot);
        cc.find("Canvas/backPack").getComponent("BackPackUI").show();
        cc.find("Canvas/backPack/tab/tab_weap").active = false;
        cc.find("Canvas/heroPanel/btnPanMine/btn_stake").active = true;
      },
      setDefiData: function setDefiData() {
        var currenttime = Date.parse(new Date()) / 1e3;
        var reward;
        var poolDataLocal = cc.sys.localStorage.getItem("poolData");
        poolDataLocal && (poolData = JSON.parse(poolDataLocal));
        if (poolData.configs && poolData.userList && poolData.poolConfig) {
          var timepassed = currenttime - poolData.poolConfig.last_mine;
          var expected = parseFloat(poolData.poolToken * timepassed / (24 * poolData.poolConfig.rate * 3600));
          poolData.poolToken = (poolData.poolToken - expected).toFixed(4);
          poolData.defiToken = (poolData.defiToken + expected).toFixed(4);
          var timepassed_user = currenttime - poolData.userList.lasttime;
          reward = (poolData.defiToken - poolData.defiToken * Math.pow(.999996, timepassed_user * poolData.bal_ratio)).toFixed(4);
        }
        cc.find("Canvas/defiPanel/pan_pool/num_pool").getComponent(cc.Label).string = poolData.poolToken;
        cc.find("Canvas/defiPanel/pan_pool/num_defi").getComponent(cc.Label).string = poolData.defiToken;
        cc.find("Canvas/defiPanel/num_earnings").getComponent(cc.Label).string = reward;
      },
      show: function show() {
        cc.find("Canvas/heroPanel").getComponent("PanelUI").hide();
        cc.find("Canvas/upgradePanel").getComponent("upgradePanel").hide();
        cc.find("Canvas/backPack").getComponent("BackPackUI").hide();
        cc.find("Canvas/Shop").getComponent("ShopUI").hide();
        cc.find("Canvas/tipPanel").getComponent("TipPanelUI").hide();
        var poolDataLocal = cc.sys.localStorage.getItem("poolData");
        poolDataLocal && (poolData = JSON.parse(poolDataLocal));
        if (this.heroSlots) for (var i = 0; i < this.heroSlots.length; ++i) this.heroSlots[i].destroy();
        this.heroSlots = [];
        var userDefiDataLocal = cc.sys.localStorage.getItem("userDefiData");
        if (userDefiDataLocal) {
          userDefiData = JSON.parse(userDefiDataLocal);
          for (var _i = 0; _i < userDefiData.length; ++_i) {
            var heroSlot = this.addHeroSlot(_i);
            this.heroSlots.push(heroSlot);
          }
        }
        this.node.active = true;
        this.node.emit("fade-in");
        this.home.toggleHomeBtns(false);
      },
      hide: function hide() {
        if (this.heroSlots) for (var i = 0; i < this.heroSlots.length; ++i) this.heroSlots[i].destroy();
        cc.find("Canvas/heroPanel/btnPanMine/btn_stake").active = false;
        cc.find("Canvas/backPack/tab/tab_weap").active = true;
        this.node.emit("fade-out");
        this.home.toggleHomeBtns(true);
      },
      update: function update(dt) {
        this.setDefiData();
      }
    });
    cc._RF.pop();
  }, {} ],
  DyLabel: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "ecc7cWEhQNLoJKX/2jTih8Y", "DyLabel");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var DyLabel = function(_super) {
      __extends(DyLabel, _super);
      function DyLabel() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.m_labels = [];
        return _this;
      }
      DyLabel.prototype.onLoad = function() {
        var _this = this;
        this.node.children.forEach(function(node) {
          _this.m_labels.push(node.getComponent(cc.Label));
        });
      };
      DyLabel.prototype.start = function() {};
      DyLabel.prototype.setText = function(str) {
        this.setString(str);
      };
      DyLabel.prototype.setString = function(str) {
        this.m_labels.forEach(function(label) {
          label.string = str;
        });
        this.doAnimate();
      };
      DyLabel.prototype.doAnimate = function() {
        this.getComponent(cc.Animation).playAdditive("douyingAni");
      };
      DyLabel = __decorate([ ccclass ], DyLabel);
      return DyLabel;
    }(cc.Component);
    exports.default = DyLabel;
    cc._RF.pop();
  }, {} ],
  EnergyCounter: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "70152iIQt1AkKnsFXGgadR8", "EnergyCounter");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        timeToRecover: 0,
        totalCount: 0,
        currentCount: 0,
        labelTimer: {
          default: null,
          type: cc.Label
        },
        labelCount: {
          default: null,
          type: cc.Label
        },
        progressBar: {
          default: null,
          type: cc.ProgressBar
        }
      },
      onLoad: function onLoad() {
        this.timer = 0;
      },
      update: function update(dt) {
        var ratio = this.timer / this.timeToRecover;
        this.progressBar.progress = ratio;
        this.currentCount > this.totalCount && (this.currentCount = this.totalCount);
        var timeLeft = Math.floor(this.timeToRecover - this.timer);
        this.labelCount.string = this.currentCount + "/" + this.totalCount;
        this.labelTimer.string = Math.floor(timeLeft / 60).toString() + ":" + (timeLeft % 60 < 10 ? "0" : "") + timeLeft % 60;
        this.timer += dt;
        if (this.timer >= this.timeToRecover) {
          this.timer = 0;
          this.currentCount++;
        }
      }
    });
    cc._RF.pop();
  }, {} ],
  Foe: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "d887bx46FZAa4lxVyJ37BSp", "Foe");
    "use strict";
    var MoveState = require("Move").MoveState;
    var FoeType = require("Types").FoeType;
    var ProjectileType = require("Types").ProjectileType;
    var AttackType = cc.Enum({
      Melee: -1,
      Range: -1
    });
    cc.Class({
      extends: cc.Component,
      properties: {
        foeType: {
          default: FoeType.Foe0,
          type: FoeType
        },
        atkType: {
          default: AttackType.Melee,
          type: AttackType
        },
        projectileType: {
          default: ProjectileType.Arrow,
          type: ProjectileType
        },
        hitPoint: 0,
        hurtRadius: 0,
        atkRange: 0,
        atkDist: 0,
        atkDuration: 0,
        atkStun: 0,
        atkPrepTime: 0,
        corpseDuration: 0,
        sfAtkDirs: [ cc.SpriteFrame ],
        fxSmoke: cc.ParticleSystem,
        fxBlood: cc.Animation,
        fxBlade: cc.Animation
      },
      init: function init(waveMng) {
        this.waveMng = waveMng;
        this.player = waveMng.player;
        this.isAttacking = false;
        this.isAlive = false;
        this.isInvincible = false;
        this.isMoving = false;
        this.hp = this.hitPoint;
        this.move = this.getComponent("Move");
        this.anim = this.move.anim;
        this.spFoe = this.anim.getComponent(cc.Sprite);
        this.bloodDuration = this.fxBlood.getAnimationState("blood").clip.duration;
        this.fxBlood.node.active = false;
        this.fxBlade.node.active = false;
        this.anim.getAnimationState("born") ? this.anim.play("born") : this.readyToMove();
      },
      update: function update(dt) {
        if (false === this.isAlive) return;
        var dist = this.player.node.position.sub(this.node.position).mag();
        if (this.player.isAttacking && false === this.isInvincible && dist < this.hurtRadius) {
          this.dead();
          return;
        }
        if (this.isAttacking && this.player.isAlive && dist < this.player.hurtRadius) {
          this.player.dead();
          return;
        }
        if (this.player && this.isMoving) {
          var dir = this.player.node.position.sub(this.node.position);
          var rad = Math.atan2(dir.y, dir.x);
          var deg = cc.misc.radiansToDegrees(rad);
          if (dist < this.atkRange) {
            this.prepAttack(dir);
            return;
          }
          this.node.emit("update-dir", {
            dir: dir.normalize()
          });
        }
      },
      readyToMove: function readyToMove() {
        this.isAlive = true;
        this.isMoving = true;
        this.fxSmoke.resetSystem();
      },
      prepAttack: function prepAttack(dir) {
        var animName = "";
        animName = Math.abs(dir.x) >= Math.abs(dir.y) ? "pre_atk_right" : dir.y > 0 ? "pre_atk_up" : "pre_atk_down";
        this.node.emit("freeze");
        this.anim.play(animName);
        this.isMoving = false;
        this.scheduleOnce(this.attack, this.atkPrepTime);
      },
      attack: function attack() {
        if (false === this.isAlive) return;
        this.anim.stop();
        var atkDir = this.player.node.position.sub(this.node.position);
        var targetPos = null;
        this.atkType === AttackType.Melee && (targetPos = this.node.position.add(atkDir.normalize().mul(this.atkDist)));
        this.attackOnTarget(atkDir, targetPos);
      },
      attackOnTarget: function attackOnTarget(atkDir, targetPos) {
        var deg = cc.misc.radiansToDegrees(cc.v2(0, 1).signAngle(atkDir));
        var angleDivider = [ 0, 45, 135, 180 ];
        var slashPos = null;
        function getAtkSF(mag, sfAtkDirs) {
          var atkSF = null;
          for (var i = 1; i < angleDivider.length; ++i) {
            var min = angleDivider[i - 1];
            var max = angleDivider[i];
            if (mag <= max && mag > min) {
              atkSF = sfAtkDirs[i - 1];
              return atkSF;
            }
          }
          if (null === atkSF) {
            cc.error("cannot find correct attack pose sprite frame! mag: " + mag);
            return null;
          }
        }
        var mag = Math.abs(deg);
        if (deg <= 0) {
          this.anim.node.scaleX = 1;
          this.spFoe.spriteFrame = getAtkSF(mag, this.sfAtkDirs);
        } else {
          this.anim.node.scaleX = -1;
          this.spFoe.spriteFrame = getAtkSF(mag, this.sfAtkDirs);
        }
        var delay = cc.delayTime(this.atkStun);
        var callback = cc.callFunc(this.onAtkFinished, this);
        if (this.atkType === AttackType.Melee) {
          var moveAction = cc.moveTo(this.atkDuration, targetPos).easing(cc.easeQuinticActionOut());
          this.node.runAction(cc.sequence(moveAction, delay, callback));
          this.isAttacking = true;
        } else {
          if (this.projectileType === ProjectileType.None) return;
          this.waveMng.spawnProjectile(this.projectileType, this.node.position, atkDir);
          this.node.runAction(cc.sequence(delay, callback));
        }
      },
      onAtkFinished: function onAtkFinished() {
        this.isAttacking = false;
        this.isAlive && (this.isMoving = true);
      },
      dead: function dead() {
        this.move.stop();
        this.isMoving = false;
        this.isAttacking = false;
        this.anim.play("dead");
        this.fxBlood.node.active = true;
        this.fxBlood.node.scaleX = this.anim.node.scaleX;
        this.fxBlood.play("blood");
        this.fxBlade.node.active = true;
        this.fxBlade.node.rotation = 2 * (Math.random() - .5) * 40;
        this.fxBlade.play("blade");
        this.unscheduleAllCallbacks();
        this.node.stopAllActions();
        this.waveMng.hitFoe();
        this.player.addKills();
        if (--this.hp > 0) {
          this.isInvincible = true;
          this.scheduleOnce(this.invincible, this.bloodDuration);
        } else {
          this.isAlive = false;
          this.scheduleOnce(this.corpse, this.bloodDuration);
          this.waveMng.killFoe();
        }
      },
      invincible: function invincible() {
        this.fxBlood.node.active = false;
        this.isMoving = true;
        var blink = cc.blink(1, 6);
        var callback = cc.callFunc(this.onInvincibleEnd, this);
        this.anim.node.runAction(cc.sequence(blink, callback));
      },
      onInvincibleEnd: function onInvincibleEnd() {
        this.isInvincible = false;
      },
      corpse: function corpse() {
        this.anim.play("corpse");
        this.fxBlood.node.active = false;
        this.scheduleOnce(this.recycle, this.corpseDuration);
      },
      recycle: function recycle() {
        this.waveMng.despawnFoe(this);
      }
    });
    cc._RF.pop();
  }, {
    Move: "Move",
    Types: "Types"
  } ],
  GameOverUI: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "c3ee4ElVWtB2Lzir0h5v/ow", "GameOverUI");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {},
      init: function init(game) {
        this.game = game;
        this.hide();
      },
      show: function show() {
        this.node.setPosition(0, 0);
      },
      hide: function hide() {
        this.node.x = 3e3;
      },
      restart: function restart() {
        this.game.restart();
      }
    });
    cc._RF.pop();
  }, {} ],
  Game: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "f8d83fBpLZCEqij5BvvBhRZ", "Game");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        player: cc.Node,
        inGameUI: cc.Node,
        playerFX: cc.Node,
        waveMng: cc.Node,
        bossMng: cc.Node,
        poolMng: cc.Node,
        foeGroup: cc.Node,
        deathUI: cc.Node,
        gameOverUI: cc.Node,
        cameraRoot: cc.Animation
      },
      onLoad: function onLoad() {
        this.playerFX = this.playerFX.getComponent("PlayerFX");
        this.playerFX.init(this);
        this.player = this.player.getComponent("Player");
        this.player.init(this);
        this.player.node.active = false;
        this.poolMng = this.poolMng.getComponent("PoolMng");
        this.poolMng.init();
        this.waveMng = this.waveMng.getComponent("WaveMng");
        this.waveMng.init(this);
        this.bossMng = this.bossMng.getComponent("BossMng");
        this.bossMng.init(this);
        this.sortMng = this.foeGroup.getComponent("SortMng");
        this.sortMng.init();
      },
      start: function start() {
        this.playerFX.playIntro();
        this.inGameUI = this.inGameUI.getComponent("InGameUI");
        this.inGameUI.init(this);
        this.deathUI = this.deathUI.getComponent("DeathUI");
        this.deathUI.init(this);
        this.gameOverUI = this.gameOverUI.getComponent("GameOverUI");
        this.gameOverUI.init(this);
      },
      pause: function pause() {
        var scheduler = cc.director.getScheduler();
        scheduler.pauseTarget(this.waveMng);
        this.sortMng.enabled = false;
      },
      resume: function resume() {
        var scheduler = cc.director.getScheduler();
        scheduler.resumeTarget(this.waveMng);
        this.sortMng.enabled = true;
      },
      cameraShake: function cameraShake() {
        this.cameraRoot.play("camera-shake");
      },
      death: function death() {
        this.deathUI.show();
        this.pause();
      },
      revive: function revive() {
        this.deathUI.hide();
        this.playerFX.playRevive();
        this.player.revive();
      },
      clearAllFoes: function clearAllFoes() {
        var nodeList = this.foeGroup.children;
        for (var i = 0; i < nodeList.length; ++i) {
          var foe = nodeList[i].getComponent("Foe");
          if (foe) foe.dead(); else {
            var projectile = nodeList[i].getComponent("Projectile");
            projectile && projectile.broke();
          }
        }
      },
      playerReady: function playerReady() {
        this.resume();
        this.waveMng.startWave();
        this.player.node.active = true;
        this.player.ready();
      },
      gameOver: function gameOver() {
        this.deathUI.hide();
        this.gameOverUI.show();
      },
      restart: function restart() {
        cc.director.loadScene("PlayGame");
      }
    });
    cc._RF.pop();
  }, {} ],
  HeroSlot: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "648ecAs4bREAJsQ6IycZbX7", "HeroSlot");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        sfAttributes: {
          default: [],
          type: cc.SpriteFrame
        },
        sfBorders: {
          default: [],
          type: cc.SpriteFrame
        },
        labelLevel: {
          default: null,
          type: cc.Label
        },
        spAttribute: {
          default: null,
          type: cc.Sprite
        },
        spBorder: {
          default: null,
          type: cc.Sprite
        },
        dbhead: {
          default: [],
          type: cc.Node
        },
        dbbutton: {
          default: null,
          type: cc.Button
        },
        title: cc.Label,
        nftvalue: cc.Label
      },
      onLoad: function onLoad() {
        this.dbDisplay = this.dbhead.getComponent(dragonBones.ArmatureDisplay);
        this.dbArmature = this.dbDisplay.armature();
        this.eyeDisplay = cc.find("eyes").getComponent(dragonBones.ArmatureDisplay);
      },
      refresh: function refresh(herodata) {
        var bgIdx = herodata.level - 1;
        bgIdx >= 7 && (bgIdx = 6);
        var attIdx = herodata.category;
        var levelIdx = herodata.level;
        this.labelLevel.string = "LV." + levelIdx;
        this.spBorder.spriteFrame = this.sfBorders[bgIdx];
        this.spAttribute.spriteFrame = this.sfAttributes[attIdx];
        this.title.string = herodata.token_name;
        this.nftvalue.string = herodata.nft_value;
      },
      string_to_arr: function string_to_arr(str) {
        var charmap = ".12345abcdefghijklmnopqrstuvwxyz";
        var gene = new Array();
        for (var i = 0; i < 12; ++i) gene[i] = charmap.indexOf(str.charAt(i));
        return gene;
      },
      updateHeroslot: function updateHeroslot(str) {
        var gene = this.string_to_arr(str);
        this.dbArmature.getSlot("slot_hair").displayIndex = gene[2];
        this.dbArmature.getSlot("slot_item").displayIndex = gene[4];
        this.dbArmature.getSlot("skin_head").displayIndex = gene[0];
        this.dbArmature.getSlot("skin_ear").displayIndex = gene[0];
        this.dbArmature.getSlot("skin_neck").displayIndex = gene[0];
        this.updateHat(gene[1]);
        this.updateEye(gene[3]);
      },
      updateHat: function updateHat(s) {
        this.dbArmature.getSlot("slot_hat").displayIndex = void 0;
        if (0 != s) {
          this.dbArmature.getSlot("slot_hat").displayIndex = s - 1;
          this.dbArmature.getSlot("slot_hair").displayIndex = void 0;
          this.dbArmature.getSlot("slot_item").displayIndex = void 0;
        }
      },
      updateEye: function updateEye(s) {
        var eyes = this.eyeDisplay.buildArmature("e_" + s);
        eyes.timeScale = (s + 1) / 3;
        this.dbArmature.getSlot("skin_eyes").childArmature = eyes.armature();
      }
    });
    cc._RF.pop();
  }, {} ],
  HomeUI1: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "aa77bcy1MlA3bRL8zpupFoD", "HomeUI1");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        menuAnim: {
          default: null,
          type: cc.Animation
        },
        menuParticle: {
          default: null,
          type: cc.ParticleSystem
        },
        btnGroup: {
          default: null,
          type: cc.Node
        }
      },
      onLoad: function onLoad() {},
      start: function start() {
        cc.eventManager.pauseTarget(this.btnGroup, true);
        this.scheduleOnce(function() {
          this.menuAnim.play();
          this.menuParticle.enabled = false;
        }.bind(this), 2);
      },
      showParticle: function showParticle() {
        this.menuParticle.enabled = true;
      },
      enableButtons: function enableButtons() {
        cc.eventManager.resumeTarget(this.btnGroup, true);
      },
      playGame: function playGame() {
        cc.eventManager.pauseTarget(this.btnGroup, true);
        cc.director.loadScene("PlayGame");
      }
    });
    cc._RF.pop();
  }, {} ],
  HomeUI: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "80382PDGl1Jf4nvzaq1gyOV", "HomeUI");
    "use strict";
    var BackPackUI = require("BackPackUI");
    var ShopUI = require("ShopUI");
    var BoxUI = require("BoxUI");
    var DefiUI = require("DefiUI");
    var PanelType = cc.Enum({
      Home: -1,
      Box: -1,
      NFT: -1,
      DeFi: -1,
      Shop: -1,
      Risk: -1
    });
    cc.Class({
      extends: cc.Component,
      properties: {
        menuAnim: {
          default: null,
          type: cc.Animation
        },
        buyboxAnim: {
          default: null,
          type: cc.Animation
        },
        homeBtnGroups: {
          default: [],
          type: cc.Node
        },
        backPackUI: {
          default: null,
          type: BackPackUI
        },
        shopUI: ShopUI,
        DefiUI: DefiUI,
        boxUI: BoxUI
      },
      onLoad: function onLoad() {
        this.curPanel = PanelType.Home;
        this.menuAnim.play("menu_reset");
      },
      start: function start() {
        this.backPackUI.init(this);
        this.shopUI.init(this);
        this.DefiUI.init(this);
        this.boxUI.init(this, PanelType.Box);
        this.scheduleOnce(function() {
          this.menuAnim.play("menu_intro");
        }.bind(this), .5);
      },
      toggleHomeBtns: function toggleHomeBtns(enable) {
        for (var i = 0; i < this.homeBtnGroups.length; ++i) {
          var group = this.homeBtnGroups[i];
          enable ? cc.director.getScheduler().resumeTarget(group) : cc.director.getScheduler().pauseTarget(group);
        }
      },
      gotoShop: function gotoShop() {
        if (this.curPanel !== PanelType.Shop) {
          this.menuAnim.play("menu_back");
          this.scheduleOnce(function() {
            this.shopUI.show();
          }.bind(this), .5);
        }
      },
      gotoDefi: function gotoDefi() {
        this.curPanel !== PanelType.DeFi && this.scheduleOnce(function() {
          this.DefiUI.show();
        }.bind(this), .5);
      },
      gotoBox: function gotoBox() {
        cc.find("Canvas/heroPanel").getComponent("PanelUI").hide();
        cc.find("Canvas/upgradePanel").getComponent("upgradePanel").hide();
        cc.find("Canvas/Shop").getComponent("ShopUI").hide();
        cc.find("Canvas/backPack").getComponent("BackPackUI").hide();
        cc.find("Canvas/tipPanel").getComponent("TipPanelUI").hide();
        cc.find("Canvas/defiPanel").getComponent("DefiUI").hide();
        if (this.curPanel !== PanelType.Box) {
          this.menuAnim.play("menu_back");
          this.scheduleOnce(function() {
            this.boxUI.show();
          }.bind(this), .4);
        }
      },
      gotoHome: function gotoHome() {
        cc.find("Canvas/heroPanel").getComponent("PanelUI").hide();
        cc.find("Canvas/upgradePanel").getComponent("upgradePanel").hide();
        cc.find("Canvas/Shop").getComponent("ShopUI").hide();
        cc.find("Canvas/backPack").getComponent("BackPackUI").hide();
        cc.find("Canvas/tipPanel").getComponent("TipPanelUI").hide();
        cc.find("Canvas/defiPanel").getComponent("DefiUI").hide();
        if (this.curPanel !== PanelType.Home) if (this.curPanel === PanelType.Shop) {
          this.shopUI.hide();
          this.curPanel = PanelType.Home;
          this.scheduleOnce(function() {
            this.menuAnim.play("menu_intro");
          }.bind(this), 1.5);
        } else if (this.curPanel === PanelType.Box) {
          this.boxUI.hide();
          this.curPanel = PanelType.Home;
          this.scheduleOnce(function() {
            this.menuAnim.play("menu_intro");
          }.bind(this), 1.5);
        }
      },
      gotoKill: function gotoKill() {
        cc.director.loadScene("PlayGame");
      },
      buyBox1: function buyBox1() {
        this.buyboxAnim.play("home_buybox");
        cc.find("CCC").getComponent("CCCManager").buybox(1);
      },
      buyBox5: function buyBox5() {
        this.buyboxAnim.play("home_buybox");
        cc.find("CCC").getComponent("CCCManager").buybox(5);
      }
    });
    cc._RF.pop();
  }, {
    BackPackUI: "BackPackUI",
    BoxUI: "BoxUI",
    DefiUI: "DefiUI",
    ShopUI: "ShopUI"
  } ],
  InGameUI: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "8df10iIWI5JgrcFs/5AlGtD", "InGameUI");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        waveUI: cc.Node,
        killDisplay: cc.Node,
        comboDisplay: cc.Node
      },
      init: function init(game) {
        this.waveUI = this.waveUI.getComponent("WaveUI");
        this.waveUI.node.active = false;
        this.killDisplay = this.killDisplay.getComponent("KillDisplay");
        this.killDisplay.node.active = false;
        this.comboDisplay = this.comboDisplay.getComponent("ComboDisplay");
        this.comboDisplay.init();
      },
      showWave: function showWave(num) {
        this.waveUI.node.active = true;
        this.waveUI.show(num);
      },
      showKills: function showKills(num) {
        this.killDisplay.playKill(num);
      },
      addCombo: function addCombo() {
        this.comboDisplay.playCombo();
      }
    });
    cc._RF.pop();
  }, {} ],
  ItemList: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "17835Y2g5RH1YfRoE2gXjcq", "ItemList");
    "use strict";
    var Item = cc.Class({
      name: "Item",
      properties: {
        id: 0,
        itemName: "",
        itemPrice: 0,
        iconSF: cc.SpriteFrame
      }
    });
    cc.Class({
      extends: cc.Component,
      properties: {
        items: {
          default: [],
          type: Item
        },
        itemPrefab: cc.Prefab
      },
      onLoad: function onLoad() {
        for (var i = 0; i < this.items.length; ++i) {
          var item = cc.instantiate(this.itemPrefab);
          var data = this.items[i];
          this.node.addChild(item);
          item.getComponent("ItemTemplate").init({
            id: data.id,
            itemName: data.itemName,
            itemPrice: data.itemPrice,
            iconSF: data.iconSF
          });
        }
      }
    });
    cc._RF.pop();
  }, {} ],
  ItemTemplate: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "84c0a/TcQhJQ5lSYyY4gUa6", "ItemTemplate");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        id: 0,
        icon: cc.Sprite,
        itemName: cc.Label,
        itemPrice: cc.Label
      },
      init: function init(data) {
        this.id = data.id;
        this.icon.spriteFrame = data.iconSF;
        this.itemName.string = data.itemName;
        this.itemPrice.string = data.itemPrice;
      }
    });
    cc._RF.pop();
  }, {} ],
  KillDisplay: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "592dd/u1/tEOJgCdwAZWLVG", "KillDisplay");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        labelKills: cc.Label,
        anim: cc.Animation
      },
      playKill: function playKill(kills) {
        this.node.active = true;
        this.labelKills.string = kills;
        this.anim.play("kill-pop");
      },
      hide: function hide() {
        this.node.active = false;
      }
    });
    cc._RF.pop();
  }, {} ],
  LanguageData: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "61de062n4dJ7ZM9/Xdumozn", "LanguageData");
    "use strict";
    var Polyglot = require("polyglot.min");
    var _cc$_decorator = cc._decorator, ccclass = _cc$_decorator.ccclass, property = _cc$_decorator.property;
    var polyInst = null;
    window.i18n || (window.i18n = {
      languages: {
        zh: require("../i18n/zh"),
        en: require("../i18n/en")
      },
      curLang: ""
    });
    window.i18n.curLang = "en";
    var langLocal = cc.sys.localStorage.getItem("curLang");
    langLocal && (window.i18n.curLang = langLocal);
    initPolyglot(loadLanguageData(window.i18n.curLang) || {});
    function loadLanguageData(language) {
      return window.i18n.languages[language];
    }
    function initPolyglot(data) {
      data && (polyInst ? polyInst.replace(data) : polyInst = new Polyglot({
        phrases: data,
        allowMissing: true
      }));
    }
    module.exports = {
      init: function init(language) {
        if (language === window.i18n.curLang) return;
        var data = loadLanguageData(language) || {};
        window.i18n.curLang = language;
        initPolyglot(data);
        this.inst = polyInst;
      },
      t: function t(key, opt) {
        if (polyInst) return polyInst.t(key, opt);
      },
      inst: polyInst,
      updateSceneRenderers: function updateSceneRenderers() {
        var rootNodes = cc.director.getScene().children;
        var allLocalizedLabels = [];
        for (var i = 0; i < rootNodes.length; ++i) {
          var labels = rootNodes[i].getComponentsInChildren("LocalizedLabel");
          Array.prototype.push.apply(allLocalizedLabels, labels);
        }
        for (var _i = 0; _i < allLocalizedLabels.length; ++_i) {
          var label = allLocalizedLabels[_i];
          if (!label.node.active) continue;
          label.updateLabel();
        }
        var allLocalizedSprites = [];
        for (var _i2 = 0; _i2 < rootNodes.length; ++_i2) {
          var sprites = rootNodes[_i2].getComponentsInChildren("LocalizedSprite");
          Array.prototype.push.apply(allLocalizedSprites, sprites);
        }
        for (var _i3 = 0; _i3 < allLocalizedSprites.length; ++_i3) {
          var sprite = allLocalizedSprites[_i3];
          if (!sprite.node.active) continue;
          sprite.updateSprite(window.i18n.curLang);
        }
      }
    };
    cc._RF.pop();
  }, {
    "../i18n/en": "en",
    "../i18n/zh": "zh",
    "polyglot.min": "polyglot.min"
  } ],
  LocalizedLabel: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "744dcs4DCdNprNhG0xwq6FK", "LocalizedLabel");
    "use strict";
    var i18n = require("LanguageData");
    function debounce(func, wait, immediate) {
      var timeout;
      return function() {
        var context = this, args = arguments;
        var later = function later() {
          timeout = null;
          immediate || func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        callNow && func.apply(context, args);
      };
    }
    cc.Class({
      extends: cc.Component,
      editor: {
        executeInEditMode: true,
        menu: "i18n/LocalizedLabel"
      },
      properties: {
        dataID: {
          get: function get() {
            return this._dataID;
          },
          set: function set(val) {
            if (this._dataID !== val) {
              this._dataID = val;
              false;
              this.updateLabel();
            }
          }
        },
        _dataID: ""
      },
      onLoad: function onLoad() {
        false;
        i18n.inst || i18n.init();
        this.fetchRender();
      },
      fetchRender: function fetchRender() {
        var label = this.getComponent(cc.Label);
        if (label) {
          this.label = label;
          this.updateLabel();
          return;
        }
      },
      updateLabel: function updateLabel() {
        if (!this.label) {
          cc.error("Failed to update localized label, label component is invalid!");
          return;
        }
        var localizedString = i18n.t(this.dataID);
        localizedString && (this.label.string = i18n.t(this.dataID));
      }
    });
    cc._RF.pop();
  }, {
    LanguageData: "LanguageData"
  } ],
  LocalizedSprite: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "f34ac2GGiVOBbG6XlfvgYP4", "LocalizedSprite");
    "use strict";
    var SpriteFrameSet = require("SpriteFrameSet");
    cc.Class({
      extends: cc.Component,
      editor: {
        executeInEditMode: true,
        menu: "i18n/LocalizedSprite"
      },
      properties: {
        spriteFrameSet: {
          default: [],
          type: SpriteFrameSet
        }
      },
      onLoad: function onLoad() {
        this.fetchRender();
      },
      fetchRender: function fetchRender() {
        var sprite = this.getComponent(cc.Sprite);
        if (sprite) {
          this.sprite = sprite;
          this.updateSprite(window.i18n.curLang);
          return;
        }
      },
      getSpriteFrameByLang: function getSpriteFrameByLang(lang) {
        for (var i = 0; i < this.spriteFrameSet.length; ++i) if (this.spriteFrameSet[i].language === lang) return this.spriteFrameSet[i].spriteFrame;
      },
      updateSprite: function updateSprite(language) {
        if (!this.sprite) {
          cc.error("Failed to update localized sprite, sprite component is invalid!");
          return;
        }
        var spriteFrame = this.getSpriteFrameByLang(language);
        !spriteFrame && this.spriteFrameSet[0] && (spriteFrame = this.spriteFrameSet[0].spriteFrame);
        this.sprite.spriteFrame = spriteFrame;
      }
    });
    cc._RF.pop();
  }, {
    SpriteFrameSet: "SpriteFrameSet"
  } ],
  MainMenu: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "1bc0eZACFdK24h0UsytreOq", "MainMenu");
    "use strict";
    var MenuSidebar = require("MenuSidebar");
    cc.Class({
      extends: cc.Component,
      properties: {
        sidebar: MenuSidebar,
        roller: cc.Node,
        panelWidth: 0,
        tabSwitchDuration: 0
      },
      onLoad: function onLoad() {
        this.sidebar.init(this);
        this.curPanelIdx = 0;
        this.roller.x = this.curPanelIdx * -this.panelWidth;
      },
      switchPanel: function switchPanel(idx) {
        this.curPanelIdx = idx;
        var newX = this.curPanelIdx * -this.panelWidth;
        var rollerMove = cc.moveTo(this.tabSwitchDuration, cc.v2(newX, 0)).easing(cc.easeQuinticActionInOut());
        var callback = cc.callFunc(this.onSwitchPanelFinished, this);
        this.roller.stopAllActions();
        cc.director.getScheduler().pauseTarget(this.roller);
        this.roller.runAction(cc.sequence(rollerMove, callback));
      },
      onSwitchPanelFinished: function onSwitchPanelFinished() {
        cc.director.getScheduler().resumeTarget(this.roller);
      }
    });
    cc._RF.pop();
  }, {
    MenuSidebar: "MenuSidebar"
  } ],
  MenuSidebar: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "95628GDDSZIYpJENqXlvcpc", "MenuSidebar");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        tabIcons: {
          default: [],
          type: cc.SpriteFrame
        },
        tabPrefab: cc.Prefab,
        container: cc.Node,
        highlight: cc.Node,
        tabWidth: 0
      },
      init: function init(mainMenu) {
        this.mainMenu = mainMenu;
        this.tabSwitchDuration = mainMenu.tabSwitchDuration;
        this.curTabIdx = 0;
        this.tabs = [];
        for (var i = 0; i < this.tabIcons.length; ++i) {
          var iconSF = this.tabIcons[i];
          var tab = cc.instantiate(this.tabPrefab).getComponent("TabCtrl");
          this.container.addChild(tab.node);
          tab.init({
            sidebar: this,
            idx: i,
            iconSF: iconSF
          });
          this.tabs[i] = tab;
        }
        this.tabs[this.curTabIdx].turnBig();
        this.highlight.x = this.curTabIdx * this.tabWidth;
      },
      tabPressed: function tabPressed(idx) {
        for (var i = 0; i < this.tabs.length; ++i) {
          var tab = this.tabs[i];
          if (tab.idx === idx) {
            tab.turnBig();
            cc.director.getScheduler().pauseTarget(tab.node);
          } else if (this.curTabIdx === tab.idx) {
            tab.turnSmall();
            cc.director.getScheduler().resumeTarget(tab.node);
          }
        }
        this.curTabIdx = idx;
        var highlightMove = cc.moveTo(this.tabSwitchDuration, cc.v2(this.curTabIdx * this.tabWidth)).easing(cc.easeQuinticActionInOut());
        this.highlight.stopAllActions();
        this.highlight.runAction(highlightMove);
        this.mainMenu.switchPanel(this.curTabIdx);
      }
    });
    cc._RF.pop();
  }, {} ],
  Move: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "03fecYvs+9L07SPviQLuLj3", "Move");
    "use strict";
    var MoveState = cc.Enum({
      None: -1,
      Stand: -1,
      Up: -1,
      Right: -1,
      Down: -1,
      Left: -1
    });
    cc.Class({
      extends: cc.Component,
      properties: {
        moveSpeed: 0,
        anim: {
          default: null,
          type: cc.Animation
        }
      },
      statics: {
        MoveState: MoveState
      },
      onLoad: function onLoad() {
        this.moveState = MoveState.Stand;
        this.node.on("stand", this.stand, this);
        this.node.on("freeze", this.stop, this);
        this.node.on("update-dir", this.updateDir, this);
      },
      stand: function stand() {
        if (this.moveState !== MoveState.Stand) {
          this.anim.play("stand");
          this.moveState = MoveState.Stand;
        }
      },
      stop: function stop() {
        this.anim.stop();
        this.moveState = MoveState.None;
        this.moveDir = null;
      },
      moveUp: function moveUp() {
        if (this.moveState !== MoveState.Up) {
          this.anim.play("run_up");
          this.anim.node.scaleX = 1;
          this.moveState = MoveState.Up;
        }
      },
      moveDown: function moveDown() {
        if (this.moveState !== MoveState.Down) {
          this.anim.play("run_down");
          this.anim.node.scaleX = 1;
          this.moveState = MoveState.Down;
        }
      },
      moveRight: function moveRight() {
        if (this.moveState !== MoveState.Right) {
          this.anim.play("run_right");
          this.anim.node.scaleX = 1;
          this.moveState = MoveState.Right;
        }
      },
      moveLeft: function moveLeft() {
        if (this.moveState !== MoveState.Left) {
          this.anim.play("run_right");
          this.anim.node.scaleX = -1;
          this.moveState = MoveState.Left;
        }
      },
      updateDir: function updateDir(event) {
        this.moveDir = event.dir;
      },
      update: function update(dt) {
        if (this.moveDir) {
          this.node.x += this.moveSpeed * this.moveDir.x * dt;
          this.node.y += this.moveSpeed * this.moveDir.y * dt;
          var deg = cc.misc.radiansToDegrees(Math.atan2(this.moveDir.y, this.moveDir.x));
          deg >= 45 && deg < 135 ? this.moveUp() : deg >= 135 || deg < -135 ? this.moveLeft() : deg >= -45 && deg < 45 ? this.moveRight() : this.moveDown();
        } else this.moveState !== MoveState.None && this.stand();
      }
    });
    cc._RF.pop();
  }, {} ],
  NodePool: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "4762cqE38NHn451+NhWnQ5U", "NodePool");
    "use strict";
    var NodePool = cc.Class({
      name: "NodePool",
      properties: {
        prefab: cc.Prefab,
        size: 0
      },
      ctor: function ctor() {
        this.idx = 0;
        this.initList = [];
        this.list = [];
      },
      init: function init() {
        for (var i = 0; i < this.size; ++i) {
          var obj = cc.instantiate(this.prefab);
          this.initList[i] = obj;
          this.list[i] = obj;
        }
        this.idx = this.size - 1;
      },
      reset: function reset() {
        for (var i = 0; i < this.size; ++i) {
          var obj = this.initList[i];
          this.list[i] = obj;
          obj.active && (obj.active = false);
          obj.parent && obj.removeFromParent();
        }
        this.idx = this.size - 1;
      },
      request: function request() {
        if (this.idx < 0) {
          cc.log("Error: the pool do not have enough free item.");
          return null;
        }
        var obj = this.list[this.idx];
        obj && (obj.active = true);
        --this.idx;
        return obj;
      },
      return: function _return(obj) {
        ++this.idx;
        obj.active = false;
        obj.parent && obj.removeFromParent();
        this.list[this.idx] = obj;
      }
    });
    module.exports = NodePool;
    cc._RF.pop();
  }, {} ],
  PanelTransition: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "e5284RIOh1C4Jyzfa64lV9l", "PanelTransition");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        duration: 0
      },
      onLoad: function onLoad() {
        this.outOfWorld = cc.v2(3e3, 0);
        this.node.position = this.outOfWorld;
        var cbFadeOut = cc.callFunc(this.onFadeOutFinish, this);
        var cbFadeIn = cc.callFunc(this.onFadeInFinish, this);
        this.actionFadeIn = cc.sequence(cc.spawn(cc.fadeTo(this.duration, 255), cc.scaleTo(this.duration, 1)), cbFadeIn);
        this.actionFadeOut = cc.sequence(cc.spawn(cc.fadeTo(this.duration, 0), cc.scaleTo(this.duration, 2)), cbFadeOut);
        this.node.on("fade-in", this.startFadeIn, this);
        this.node.on("fade-out", this.startFadeOut, this);
      },
      startFadeIn: function startFadeIn() {
        cc.director.getScheduler().pauseTarget(this.node);
        this.node.position = cc.v2(0, 0);
        this.node.setScale(2);
        this.node.opacity = 0;
        this.node.runAction(this.actionFadeIn);
      },
      startFadeOut: function startFadeOut() {
        cc.director.getScheduler().pauseTarget(this.node);
        this.node.runAction(this.actionFadeOut);
      },
      onFadeInFinish: function onFadeInFinish() {
        cc.director.getScheduler().resumeTarget(this.node);
      },
      onFadeOutFinish: function onFadeOutFinish() {
        this.node.position = this.outOfWorld;
      }
    });
    cc._RF.pop();
  }, {} ],
  PanelUI: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "7ce68dcvu9MRbNg+7MtDSGk", "PanelUI");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {},
      init: function init() {},
      show: function show() {
        this.node.active = true;
        this.node.emit("fade-in");
        var suc = cc.find("Canvas/heroPanel/success");
        suc.active && cc.tween(suc).to(1, {
          scale: 3
        }).by(1, {
          scale: 1
        }).to(1, {
          scale: 1
        }).start();
      },
      hide: function hide() {
        this.node.emit("fade-out");
        cc.find("Canvas/heroPanel/fx/bg_eff1").active = false;
        cc.find("Canvas/heroPanel/fx/bg_eff2").active = false;
        cc.find("Canvas/heroPanel/fx/bg_eff3").active = false;
        cc.find("Canvas/heroPanel/success").active = false;
      }
    });
    cc._RF.pop();
  }, {} ],
  PlayerFX: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "473ddOy0BlLraG4rFvYcoyb", "PlayerFX");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        introAnim: cc.Animation,
        reviveAnim: cc.Animation
      },
      init: function init(game) {
        this.game = game;
        this.introAnim.node.active = false;
        this.reviveAnim.node.active = false;
      },
      playIntro: function playIntro() {
        this.introAnim.node.active = true;
        this.introAnim.play("start");
      },
      playRevive: function playRevive() {
        this.reviveAnim.node.active = true;
        this.reviveAnim.node.setPosition(this.game.player.node.position);
        this.reviveAnim.play("revive");
      },
      introFinish: function introFinish() {
        this.game.playerReady();
        this.introAnim.node.active = false;
      },
      reviveFinish: function reviveFinish() {
        this.game.playerReady();
        this.reviveAnim.node.active = false;
      },
      reviveKill: function reviveKill() {
        this.game.clearAllFoes();
      }
    });
    cc._RF.pop();
  }, {} ],
  Player: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "b7fe1Feo8hKMoqKLY3I4z0F", "Player");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        fxTrail: cc.ParticleSystem,
        spArrow: cc.Node,
        sfAtkDirs: [ cc.SpriteFrame ],
        attachPoints: [ cc.Vec2 ],
        sfPostAtks: [ cc.SpriteFrame ],
        spPlayer: cc.Sprite,
        spSlash: cc.Sprite,
        hurtRadius: 0,
        touchThreshold: 0,
        touchMoveThreshold: 0,
        atkDist: 0,
        atkDuration: 0,
        atkStun: 0,
        invincible: false
      },
      init: function init(game) {
        this.game = game;
        this.anim = this.getComponent("Move").anim;
        this.inputEnabled = false;
        this.isAttacking = false;
        this.isAlive = true;
        this.nextPoseSF = null;
        this.registerInput();
        this.spArrow.active = false;
        this.atkTargetPos = cc.v2(0, 0);
        this.isAtkGoingOut = false;
        this.validAtkRect = cc.rect(25, 25, 1.71 * (this.node.parent.width - 50), 1.11 * (this.node.parent.height - 50));
        this.oneSlashKills = 0;
      },
      registerInput: function registerInput() {
        var self = this;
        cc.eventManager.addListener({
          event: cc.EventListener.TOUCH_ONE_BY_ONE,
          onTouchBegan: function onTouchBegan(touch, event) {
            if (false === self.inputEnabled) return true;
            var touchLoc = touch.getLocation();
            self.touchBeganLoc = touchLoc;
            self.moveToPos = self.node.parent.convertToNodeSpaceAR(touchLoc);
            self.touchStartTime = Date.now();
            return true;
          },
          onTouchMoved: function onTouchMoved(touch, event) {
            if (false === self.inputEnabled) return;
            var touchLoc = touch.getLocation();
            self.spArrow.active = true;
            self.moveToPos = self.node.parent.convertToNodeSpaceAR(touchLoc);
            self.touchBeganLoc.sub(touchLoc).mag() > self.touchMoveThreshold && (self.hasMoved = true);
          },
          onTouchEnded: function onTouchEnded(touch, event) {
            if (false === self.inputEnabled) return;
            self.spArrow.active = false;
            self.moveToPos = null;
            self.node.emit("update-dir", {
              dir: null
            });
            var isHold = self.isTouchHold();
            if (!self.hasMoved && !isHold) {
              var touchLoc = touch.getLocation();
              var atkPos = self.node.parent.convertToNodeSpaceAR(touchLoc);
              var camPos = self.node.getComponent("camera").mainCamera.node.position;
              var atkDir = atkPos.add(camPos).sub(self.node.position);
              self.atkTargetPos = self.node.position.add(atkDir.normalize().mul(self.atkDist));
              var atkPosWorld = self.node.parent.convertToWorldSpaceAR(self.atkTargetPos);
              self.validAtkRect.contains(atkPosWorld) ? self.isAtkGoingOut = false : self.isAtkGoingOut = true;
              self.node.emit("freeze");
              self.oneSlashKills = 0;
              self.attackOnTarget(atkDir, self.atkTargetPos);
            }
            self.hasMoved = false;
          }
        }, self.node);
      },
      ready: function ready() {
        this.fxTrail.resetSystem();
        this.node.emit("stand");
        this.inputEnabled = true;
        this.isAlive = true;
      },
      isTouchHold: function isTouchHold() {
        var timeDiff = Date.now() - this.touchStartTime;
        return timeDiff >= this.touchThreshold;
      },
      attackOnTarget: function attackOnTarget(atkDir, targetPos) {
        var self = this;
        var deg = cc.misc.radiansToDegrees(cc.v2(0, 1).signAngle(atkDir));
        var angleDivider = [ 0, 12, 35, 56, 79, 101, 124, 146, 168, 180 ];
        var slashPos = null;
        function getAtkSF(mag, sfAtkDirs) {
          var atkSF = null;
          for (var i = 1; i < angleDivider.length; ++i) {
            var min = angleDivider[i - 1];
            var max = angleDivider[i];
            if (mag <= max && mag > min) {
              atkSF = sfAtkDirs[i - 1];
              self.nextPoseSF = self.sfPostAtks[Math.floor((i - 1) / 3)];
              slashPos = self.attachPoints[i - 1];
              return atkSF;
            }
          }
          if (null === atkSF) {
            console.error("cannot find correct attack pose sprite frame! mag: " + mag);
            return null;
          }
        }
        var mag = Math.abs(deg);
        if (deg <= 0) {
          this.spPlayer.node.scaleX = 1;
          this.spPlayer.spriteFrame = getAtkSF(mag, this.sfAtkDirs);
        } else {
          this.spPlayer.node.scaleX = -1;
          this.spPlayer.spriteFrame = getAtkSF(mag, this.sfAtkDirs);
        }
        var moveAction = cc.moveTo(this.atkDuration, targetPos).easing(cc.easeQuinticActionOut());
        var delay = cc.delayTime(this.atkStun);
        var callback = cc.callFunc(this.onAtkFinished, this);
        this.node.runAction(cc.sequence(moveAction, delay, callback));
        this.spSlash.node.position = slashPos;
        this.spSlash.node.rotation = mag;
        this.spSlash.enabled = true;
        this.spSlash.getComponent(cc.Animation).play("slash");
        console.log(this.node.getChildByName("hero").name);
        this.node.getChildByName("hero").getComponent("hero").attackAni();
        this.inputEnabled = false;
        this.isAttacking = true;
      },
      onAtkFinished: function onAtkFinished() {
        this.nextPoseSF && (this.spPlayer.spriteFrame = this.nextPoseSF);
        this.spSlash.enabled = false;
        this.inputEnabled = true;
        this.isAttacking = false;
        this.isAtkGoingOut = false;
        this.oneSlashKills >= 3 && this.game.inGameUI.showKills(this.oneSlashKills);
      },
      addKills: function addKills() {
        this.oneSlashKills++;
        this.game.inGameUI.addCombo();
      },
      revive: function revive() {
        var hideCB = cc.callFunc(function() {
          this.node.active = false;
        }.bind(this));
        var action = cc.sequence(cc.delayTime(.6), hideCB);
      },
      dead: function dead() {
        if (this.invincible) return;
        this.node.emit("freeze");
        this.isAlive = false;
        this.isAttacking = false;
        this.inputEnabled = false;
        this.anim.play("dead");
      },
      corpse: function corpse() {
        this.anim.play("corpse");
        this.scheduleOnce(this.death, .7);
      },
      death: function death() {
        this.game.death();
      },
      shouldStopAttacking: function shouldStopAttacking() {
        var curWorldPos = this.node.parent.convertToWorldSpaceAR(this.node.position);
        var targetWorldPos = this.node.parent.convertToWorldSpaceAR(this.atkTargetPos);
        return curWorldPos.x < this.validAtkRect.xMin && targetWorldPos.x < this.validAtkRect.xMin || curWorldPos.x > this.validAtkRect.xMax && targetWorldPos.x > this.validAtkRect.xMax || curWorldPos.y < this.validAtkRect.yMin && targetWorldPos.y < this.validAtkRect.yMin || curWorldPos.y > this.validAtkRect.yMax && targetWorldPos.y > this.validAtkRect.yMax;
      },
      update: function update(dt) {
        if (false === this.isAlive) return;
        if (this.isAttacking && this.isAtkGoingOut && this.shouldStopAttacking()) {
          this.node.stopAllActions();
          this.onAtkFinished();
        }
        if (this.inputEnabled && this.moveToPos && this.isTouchHold()) {
          var dir = this.moveToPos.sub(this.node.position);
          var rad = Math.atan2(dir.y, dir.x);
          var deg = cc.misc.radiansToDegrees(rad);
          this.spArrow.rotation = 90 - deg;
          this.node.emit("update-dir", {
            dir: dir.normalize()
          });
        }
      }
    });
    cc._RF.pop();
  }, {} ],
  PoolMng: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "15ae69NDTlDzprf2vQCDLLb", "PoolMng");
    "use strict";
    var NodePool = require("NodePool");
    var FoeType = require("Types").FoeType;
    var ProjectileType = require("Types").ProjectileType;
    var BGPool = require("BGPool");
    var BGs = require("Types").BGs;
    cc.Class({
      extends: cc.Component,
      properties: {
        foePools: {
          default: [],
          type: NodePool
        },
        projectilePools: {
          default: [],
          type: NodePool
        },
        BGPools: {
          default: [],
          type: BGPool
        }
      },
      init: function init() {
        for (var i = 0; i < this.foePools.length; ++i) this.foePools[i].init();
        for (var _i = 0; _i < this.projectilePools.length; ++_i) this.projectilePools[_i].init();
        var ra = Math.floor(Math.random() * this.BGPools.length);
        this.BGPools[ra].init();
      },
      requestFoe: function requestFoe(foeType) {
        var thePool = this.foePools[foeType];
        return thePool.idx >= 0 ? thePool.request() : null;
      },
      returnFoe: function returnFoe(foeType, obj) {
        var thePool = this.foePools[foeType];
        if (!(thePool.idx < thePool.size)) {
          cc.log("Return obj to a full pool, something has gone wrong");
          return;
        }
        thePool["return"](obj);
      },
      requestProjectile: function requestProjectile(type) {
        var thePool = this.projectilePools[type];
        return thePool.idx >= 0 ? thePool.request() : null;
      },
      returnProjectile: function returnProjectile(type, obj) {
        var thePool = this.projectilePools[type];
        if (!(thePool.idx < thePool.size)) {
          cc.log("Return obj to a full pool, something has gone wrong");
          return;
        }
        thePool["return"](obj);
      }
    });
    cc._RF.pop();
  }, {
    BGPool: "BGPool",
    NodePool: "NodePool",
    Types: "Types"
  } ],
  Projectile: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "bd907OrsYVGJpMAP56xffaF", "Projectile");
    "use strict";
    var ProjectileType = require("Types").ProjectileType;
    cc.Class({
      extends: cc.Component,
      properties: {
        projectileType: {
          default: ProjectileType.Arrow,
          type: ProjectileType
        },
        sprite: cc.Sprite,
        fxBroken: cc.Animation,
        moveSpeed: 0,
        canBreak: true
      },
      init: function init(waveMng, dir) {
        this.waveMng = waveMng;
        this.player = waveMng.player;
        var rad = Math.atan2(dir.y, dir.x);
        var deg = cc.misc.radiansToDegrees(rad);
        var rotation = 90 - deg;
        this.sprite.node.rotation = rotation;
        this.sprite.enabled = true;
        this.direction = dir.normalize();
        this.isMoving = true;
      },
      broke: function broke() {
        this.isMoving = false;
        this.sprite.enabled = false;
        this.fxBroken.node.active = true;
        this.fxBroken.play("arrow-break");
      },
      hit: function hit() {
        this.isMoving = false;
        this.onBrokenFXFinished();
      },
      onBrokenFXFinished: function onBrokenFXFinished() {
        this.fxBroken.node.active = false;
        this.waveMng.despawnProjectile(this);
      },
      update: function update(dt) {
        if (false === this.isMoving) return;
        var dist = this.player.node.position.sub(this.node.position).mag();
        if (dist < this.player.hurtRadius && this.player.isAlive) {
          if (this.canBreak && this.player.isAttacking) {
            this.broke();
            return;
          }
          this.player.dead();
          this.hit();
          return;
        }
        if (this.isMoving) {
          this.node.x += this.moveSpeed * this.direction.x * dt;
          this.node.y += this.moveSpeed * this.direction.y * dt;
          (Math.abs(this.node.x) > this.waveMng.foeGroup.width / 2 || Math.abs(this.node.y) > this.waveMng.foeGroup.height / 2) && this.onBrokenFXFinished();
        }
      }
    });
    cc._RF.pop();
  }, {
    Types: "Types"
  } ],
  ShopUI: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "9fbcf0UiNFEvZYPQa9crk/y", "ShopUI");
    "use strict";
    var HeroData = [];
    var HeroDataAll = [];
    var HeroDataCate = [];
    var cateValue = 999;
    var nftDir = 999;
    var pageSlots = 36;
    var page;
    var pageAll;
    cc.Class({
      extends: cc.Component,
      properties: {
        slotPrefab: {
          default: null,
          type: cc.Prefab
        },
        scrollView: {
          default: null,
          type: cc.ScrollView
        },
        btnPre: cc.Node,
        btnNext: cc.Node
      },
      init: function init(home) {
        this.home = home;
      },
      addHeroSlot: function addHeroSlot(i) {
        var heroSlot = cc.instantiate(this.slotPrefab);
        this.scrollView.content.addChild(heroSlot);
        heroSlot.getComponent("HeroSlot").updateHeroslot(HeroData[i].genes);
        heroSlot.getComponent("HeroSlot").refresh(HeroData[i]);
        heroSlot.getChildByName("tit").getComponent(cc.Label).string = HeroData[i].price;
        var clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = this.node;
        clickEventHandler.component = "ShopUI";
        clickEventHandler.handler = "onClickItem";
        clickEventHandler.customEventData = {
          index: i
        };
        var button = heroSlot.getComponent("HeroSlot").dbbutton;
        button.clickEvents.push(clickEventHandler);
        return heroSlot;
      },
      onClickItem: function onClickItem(event, customEventData) {
        var node = event.target;
        var index = customEventData.index;
        var heropanel = cc.find("Canvas/heroPanel");
        heropanel.getChildByName("hero01").getComponent("hero").updateHero(HeroData[index]);
        heropanel.getComponent("heroPanelUI").updatePanelDate(HeroData[index]);
        heropanel.getComponent("PanelUI").show();
        heropanel.getChildByName("btnPanDefi").active = false;
        heropanel.getChildByName("btnPanSwap").active = true;
        heropanel.getChildByName("btnPanMine").active = false;
        cc.find("Canvas/heroPanel/info/nftprice").active = true;
      },
      show: function show() {
        cc.find("Canvas/heroPanel").getComponent("PanelUI").hide();
        cc.find("Canvas/upgradePanel").getComponent("upgradePanel").hide();
        cc.find("Canvas/backPack").getComponent("BackPackUI").hide();
        cc.find("Canvas/defiPanel").getComponent("DefiUI").hide();
        cc.find("Canvas/tipPanel").getComponent("TipPanelUI").hide();
        if (this.heroSlots) for (var i = 0; i < this.heroSlots.length; ++i) this.heroSlots[i].destroy();
        var heroDataLocal = cc.sys.localStorage.getItem("swapHeroData");
        if (heroDataLocal) {
          HeroDataAll = JSON.parse(heroDataLocal);
          HeroDataCate = HeroDataAll;
        }
        page = 1;
        pageAll = parseInt(HeroDataCate.length / pageSlots) + 1;
        999 != cateValue && this.selectCate(this, cateValue);
        HeroData = HeroDataCate.slice(0, pageSlots);
        this.checkPage();
        this.heroSlots = [];
        for (var _i = 0; _i < HeroData.length; ++_i) {
          var heroSlot = this.addHeroSlot(_i);
          this.heroSlots.push(heroSlot);
        }
        this.node.active = true;
        this.node.emit("fade-in");
        this.home.toggleHomeBtns(false);
      },
      hide: function hide() {
        cc.find("Canvas/Shop/catePan/all").getComponent(cc.Toggle).isChecked = true;
        cc.find("Canvas/Shop/sortPan/nftup").getComponent(cc.Toggle).isChecked = true;
        if (this.heroSlots) for (var i = 0; i < this.heroSlots.length; ++i) this.heroSlots[i].destroy();
        this.node.emit("fade-out");
        this.home.toggleHomeBtns(true);
      },
      checkPage: function checkPage() {
        this.btnPre.active = page > 1;
        this.btnNext.active = pageAll > page;
      },
      goToNext: function goToNext() {
        for (var i = 0; i < this.heroSlots.length; ++i) this.heroSlots[i].destroy();
        page += 1;
        HeroData = HeroDataCate.slice(pageSlots * (page - 1), pageSlots * page);
        this.checkPage();
        this.heroSlots = [];
        console.log(HeroData);
        for (var _i2 = 0; _i2 < HeroData.length; ++_i2) {
          var heroSlot = this.addHeroSlot(_i2);
          this.heroSlots.push(heroSlot);
        }
      },
      goToPre: function goToPre() {
        for (var i = 0; i < this.heroSlots.length; ++i) this.heroSlots[i].destroy();
        page -= 1;
        HeroData = HeroDataCate.slice(pageSlots * (page - 1), pageSlots * page);
        this.checkPage();
        this.heroSlots = [];
        for (var _i3 = 0; _i3 < HeroData.length; ++_i3) {
          var heroSlot = this.addHeroSlot(_i3);
          this.heroSlots.push(heroSlot);
        }
      },
      selectCate: function selectCate(event, cate) {
        if (cateValue == cate) return;
        cateValue = cate;
        for (var i = 0; i < this.heroSlots.length; ++i) this.heroSlots[i].destroy();
        HeroDataCate = 999 == cate ? HeroDataAll : HeroDataAll.filter(function(item) {
          return item.category == cate;
        });
        999 != nftDir && this.sortDate(this, nftDir);
        page = 1;
        pageAll = parseInt(HeroDataCate.length / pageSlots) + 1;
        HeroData = HeroDataCate.slice(0, pageSlots);
        this.checkPage();
        this.heroSlots = [];
        for (var _i4 = 0; _i4 < HeroData.length; ++_i4) {
          var heroSlot = this.addHeroSlot(_i4);
          this.heroSlots.push(heroSlot);
        }
      },
      sortDate: function sortDate(event, dir) {
        if (nftDir == dir) return;
        nftDir = dir;
        for (var i = 0; i < this.heroSlots.length; ++i) this.heroSlots[i].destroy();
        HeroDataCate = 1 == dir ? HeroDataCate.sort(function(x, y) {
          return parseFloat(x["nft_value"]) - parseFloat(y["nft_value"]);
        }) : HeroDataCate.sort(function(x, y) {
          return parseFloat(x["nft_value"]) - parseFloat(y["nft_value"]);
        }).reverse();
        page = 1;
        HeroData = HeroDataCate.slice(0, pageSlots);
        this.checkPage();
        this.heroSlots = [];
        for (var _i5 = 0; _i5 < HeroData.length; ++_i5) {
          var heroSlot = this.addHeroSlot(_i5);
          this.heroSlots.push(heroSlot);
        }
      }
    });
    cc._RF.pop();
  }, {} ],
  ShowMask: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "78c7dPnl5JF/p5GDHEQRYOC", "ShowMask");
    "use strict";
    cc.Class({
      extends: cc.Component,
      start: function start() {
        this.getComponent(cc.Sprite).enabled = true;
      }
    });
    cc._RF.pop();
  }, {} ],
  SortMng: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "61165e1leJB+4dbkFmx1myT", "SortMng");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {},
      init: function init() {
        this.frameCount = 0;
      },
      update: function update(dt) {
        ++this.frameCount % 6 === 0 && this.sortChildrenByY();
      },
      sortChildrenByY: function sortChildrenByY() {
        var listToSort = this.node.children.slice();
        listToSort.sort(function(a, b) {
          return b.y - a.y;
        });
        for (var i = 0; i < listToSort.length; ++i) {
          var node = listToSort[i];
          node.active && node.setSiblingIndex(i);
        }
      }
    });
    cc._RF.pop();
  }, {} ],
  Spawn: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "ff6d6lonApC6or/lKfhLG/z", "Spawn");
    "use strict";
    var FoeType = require("Types").FoeType;
    var Spawn = cc.Class({
      name: "Spawn",
      properties: {
        foeType: {
          default: FoeType.Foe0,
          type: FoeType
        },
        total: 0,
        spawnInterval: 0,
        isCompany: false
      },
      ctor: function ctor() {
        this.spawned = 0;
        this.finished = false;
      },
      spawn: function spawn(poolMng) {
        if (this.spawned >= this.total) return;
        var newFoe = poolMng.requestFoe(this.foeType);
        if (newFoe) {
          this.spawned++;
          this.spawned === this.total && (this.finished = true);
          return newFoe;
        }
        cc.log("max foe count reached, will delay spawn");
        return null;
      }
    });
    module.exports = Spawn;
    cc._RF.pop();
  }, {
    Types: "Types"
  } ],
  SpriteFrameSet: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "97019Q80jpE2Yfz4zbuCZBq", "SpriteFrameSet");
    "use strict";
    var SpriteFrameSet = cc.Class({
      name: "SpriteFrameSet",
      properties: {
        language: "",
        spriteFrame: cc.SpriteFrame
      }
    });
    module.exports = SpriteFrameSet;
    cc._RF.pop();
  }, {} ],
  SubBtnsUI: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "6907fq75H1EIrLmj/AFBg+B", "SubBtnsUI");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        subBtnsAnim: cc.Animation,
        btnShowSub: cc.Button,
        btnHideSub: cc.Button,
        btnContainer: cc.Node
      },
      onLoad: function onLoad() {
        this.btnShowSub.node.active = true;
        this.btnHideSub.node.active = false;
      },
      showSubBtns: function showSubBtns() {
        this.btnContainer.active = true;
        this.subBtnsAnim.play("sub_pop");
      },
      hideSubBtns: function hideSubBtns() {
        this.subBtnsAnim.play("sub_fold");
      },
      onFinishAnim: function onFinishAnim(finishFold) {
        this.btnShowSub.node.active = finishFold;
        this.btnHideSub.node.active = !finishFold;
      }
    });
    cc._RF.pop();
  }, {} ],
  TabCtrl: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "62208XJq9ZC2oNDeQGcbCab", "TabCtrl");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        idx: 0,
        icon: cc.Sprite,
        arrow: cc.Node,
        anim: cc.Animation
      },
      init: function init(tabInfo) {
        this.sidebar = tabInfo.sidebar;
        this.idx = tabInfo.idx;
        this.icon.spriteFrame = tabInfo.iconSF;
        this.node.on("touchstart", this.onPressed.bind(this), this.node);
        this.arrow.scale = cc.v2(0, 0);
      },
      onPressed: function onPressed() {
        this.sidebar.tabPressed(this.idx);
      },
      turnBig: function turnBig() {
        this.anim.play("tab_turn_big");
      },
      turnSmall: function turnSmall() {
        this.anim.play("tab_turn_small");
      }
    });
    cc._RF.pop();
  }, {} ],
  TipPanelUI: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "fe2fbXLQTFPxKiH8TBYh+Rt", "TipPanelUI");
    "use strict";
    var tipDate = [ {
      tit: "tip_nonetit",
      des: "tip_none"
    }, {
      tit: "info_pricetit",
      des: "info_price"
    }, {
      tit: "nav_store",
      des: "nav_risk"
    }, {
      tit: "tip_systoptit",
      des: "tip_systop"
    }, {
      tit: "tip_failtit",
      des: "tip_fail"
    }, {
      tit: "tip_selltit",
      des: "tip_sell"
    }, {
      tit: "tip_claimtit",
      des: "tip_claim"
    }, {
      tit: "tip_unstaketit",
      des: "tip_unstake"
    }, {
      tit: "tip_staketit",
      des: "tip_stake"
    } ];
    cc.Class({
      extends: cc.Component,
      properties: {
        labelTitle: {
          default: null,
          type: cc.Label
        },
        labelDes: {
          default: null,
          type: cc.Label
        }
      },
      init: function init() {},
      show: function show(event, customEventData) {
        this.labelTitle.getComponent("LocalizedLabel").dataID = tipDate[parseInt(customEventData)].tit;
        this.labelDes.getComponent("LocalizedLabel").dataID = tipDate[parseInt(customEventData)].des;
        this.node.active = true;
        this.node.emit("fade-in");
      },
      hide: function hide() {
        cc.find("Canvas/tipPanel/error").getComponent(cc.Label).string = "";
        this.node.emit("fade-out");
      }
    });
    cc._RF.pop();
  }, {} ],
  Types: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "5693aA1l/JEiq6SPSIEPrEp", "Types");
    "use strict";
    var BossType = cc.Enum({
      Demon: -1,
      SkeletonKing: -1
    });
    var FoeType = cc.Enum({
      Foe0: -1,
      Foe1: -1,
      Foe2: -1,
      Foe3: -1,
      Foe5: -1,
      Foe6: -1,
      Boss1: -1,
      Boss2: -1
    });
    var ProjectileType = cc.Enum({
      Arrow: -1,
      Fireball: -1,
      None: 999
    });
    var BGs = cc.Enum({
      BG0: -1,
      BG1: -1,
      BG2: -1,
      BG3: -1
    });
    module.exports = {
      BossType: BossType,
      FoeType: FoeType,
      ProjectileType: ProjectileType,
      BGs: BGs
    };
    cc._RF.pop();
  }, {} ],
  WaveMng: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "2709b0GKQpMn4dRodMMty4Z", "WaveMng");
    "use strict";
    var Foe = require("Foe");
    var FoeType = require("Types").FoeType;
    var BossType = require("Types").BossType;
    var Spawn = require("Spawn");
    var Wave = cc.Class({
      name: "Wave",
      properties: {
        spawns: {
          default: [],
          type: Spawn
        },
        bossType: {
          default: BossType.Demon,
          type: BossType
        }
      },
      init: function init() {
        this.totalFoes = 0;
        this.spawnIdx = 0;
        for (var i = 0; i < this.spawns.length; ++i) false === this.spawns[i].isCompany && (this.totalFoes += this.spawns[i].total);
      },
      getNextSpawn: function getNextSpawn() {
        this.spawnIdx++;
        return this.spawnIdx < this.spawns.length ? this.spawns[this.spawnIdx] : null;
      }
    });
    cc.Class({
      extends: cc.Component,
      properties: {
        waves: {
          default: [],
          type: Wave
        },
        startWaveIdx: 0,
        spawnMargin: 0,
        killedFoe: {
          visible: false,
          default: 0,
          notify: function notify() {
            if (!this.currentWave || !this.waveTotalFoes) return;
            this.waveTotalFoes && this.killedFoe >= this.waveTotalFoes && this.endWave();
            if (this.waveProgress && this.waveTotalFoes) {
              var ratio = Math.min(this.killedFoe / this.waveTotalFoes, 1);
              this.waveProgress.updateProgress(ratio);
            }
          }
        },
        waveProgress: cc.Node,
        bossProgress: cc.Node
      },
      init: function init(game) {
        this.game = game;
        this.player = game.player;
        this.foeGroup = game.foeGroup;
        this.waveIdx = this.startWaveIdx;
        this.spawnIdx = 0;
        this.currentWave = this.waves[this.waveIdx];
        this.waveProgress = this.waveProgress.getComponent("WaveProgress");
        this.waveProgress.init(this);
        this.bossProgress = this.bossProgress.getComponent("BossProgress");
        this.bossProgress.init(this);
      },
      startSpawn: function startSpawn() {
        this.schedule(this.spawnFoe, this.currentSpawn.spawnInterval);
      },
      startBossSpawn: function startBossSpawn(bossSpawn) {
        this.bossSpawn = bossSpawn;
        this.waveTotalFoes = bossSpawn.total;
        this.killedFoe = 0;
        this.schedule(this.spawnBossFoe, bossSpawn.spawnInterval);
      },
      endSpawn: function endSpawn() {
        this.unschedule(this.spawnFoe);
        var nextSpawn = this.currentWave.getNextSpawn();
        if (nextSpawn) {
          this.currentSpawn = nextSpawn;
          this.startSpawn();
          nextSpawn.isCompany && this.startBoss();
        }
      },
      startWave: function startWave() {
        this.unschedule(this.spawnFoe);
        this.currentWave.init();
        this.waveTotalFoes = this.currentWave.totalFoes;
        this.killedFoe = 0;
        this.currentSpawn = this.currentWave.spawns[this.currentWave.spawnIdx];
        this.startSpawn();
        this.game.inGameUI.showWave(this.waveIdx + 1);
      },
      startBoss: function startBoss() {
        this.bossProgress.show();
        this.game.bossMng.startBoss();
      },
      endWave: function endWave() {
        this.bossProgress.hide();
        this.game.bossMng.endBoss();
        if (this.waveIdx < this.waves.length - 1) {
          this.waveIdx++;
          this.currentWave = this.waves[this.waveIdx];
          this.startWave();
        } else cc.log("all waves spawned!");
      },
      spawnFoe: function spawnFoe() {
        if (this.currentSpawn.finished) {
          this.endSpawn();
          return;
        }
        var newFoe = this.currentSpawn.spawn(this.game.poolMng);
        if (newFoe) {
          this.foeGroup.addChild(newFoe);
          newFoe.setPosition(this.getNewFoePosition());
          newFoe.getComponent("Foe").init(this);
        }
      },
      spawnBossFoe: function spawnBossFoe() {
        this.bossSpawn.finished && this.unschedule(this.spawnBossFoe);
        var newFoe = this.bossSpawn.spawn(this.game.poolMng);
        if (newFoe) {
          this.foeGroup.addChild(newFoe);
          newFoe.setPosition(this.getNewFoePosition());
          newFoe.getComponent("Foe").init(this);
        }
      },
      spawnProjectile: function spawnProjectile(projectileType, pos, dir, rot) {
        var newProjectile = this.game.poolMng.requestProjectile(projectileType);
        if (newProjectile) {
          this.foeGroup.addChild(newProjectile);
          newProjectile.setPosition(pos);
          newProjectile.getComponent("Projectile").init(this, dir);
        } else cc.log("requesting too many projectiles! please increase size");
      },
      killFoe: function killFoe() {
        this.killedFoe++;
      },
      hitFoe: function hitFoe() {
        this.game.cameraShake();
      },
      despawnFoe: function despawnFoe(foe) {
        var foeType = foe.foeType;
        this.game.poolMng.returnFoe(foeType, foe.node);
      },
      despawnProjectile: function despawnProjectile(projectile) {
        var type = projectile.projectileType;
        this.game.poolMng.returnProjectile(type, projectile.node);
      },
      getNewFoePosition: function getNewFoePosition() {
        var randX = 2 * (Math.random() - .5) * (this.foeGroup.width - this.spawnMargin) / 2;
        var randY = 2 * (Math.random() - .5) * (this.foeGroup.height - this.spawnMargin) / 2;
        return cc.v2(randX, randY);
      }
    });
    cc._RF.pop();
  }, {
    Foe: "Foe",
    Spawn: "Spawn",
    Types: "Types"
  } ],
  WaveProgress: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "a90aa7G1q5ANJGKlnUcA6SL", "WaveProgress");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        bar: cc.ProgressBar,
        head: cc.Node,
        lerpDuration: 0
      },
      onLoad: function onLoad() {},
      init: function init(waveMng) {
        this.waveMng = waveMng;
        this.bar.progress = 0;
        this.curProgress = 0;
        this.destProgress = 0;
        this.timer = 0;
        this.isLerping = false;
      },
      updateProgress: function updateProgress(progress) {
        this.curProgress = this.bar.progress;
        this.destProgress = progress;
        this.timer = 0;
        this.isLerping = true;
      },
      update: function update(dt) {
        if (false === this.isLerping) return;
        this.timer += dt;
        if (this.timer >= this.lerpDuration) {
          this.timer = this.lerpDuration;
          this.isLerping = false;
        }
        this.bar.progress = cc.misc.lerp(this.curProgress, this.destProgress, this.timer / this.lerpDuration);
        var headPosX = this.bar.barSprite.node.width * this.bar.progress;
        this.head.x = headPosX;
      }
    });
    cc._RF.pop();
  }, {} ],
  WaveUI: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "389b4yNsLZD8oJXlec0Kfzr", "WaveUI");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        labelWave: cc.Label,
        anim: cc.Animation
      },
      onLoad: function onLoad() {},
      show: function show(num) {
        this.labelWave.string = num;
        this.anim.play("wave-pop");
      },
      hide: function hide() {
        this.node.active = false;
      }
    });
    cc._RF.pop();
  }, {} ],
  buybox: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "994f8vZghNOmJ96EbbQ8cRs", "buybox");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        boxlabel: {
          default: null,
          type: cc.Node
        }
      },
      start: function start() {},
      setTXT1: function setTXT1(str) {
        this.boxlabel.active = true;
        this.boxlabel.getComponent("DyLabel").setText(str);
        this.scheduleOnce(function() {
          this.boxlabel.active = false;
        }.bind(this), 1);
      },
      setTXT5: function setTXT5(str) {
        this.boxlabel.active = true;
        this.boxlabel.getComponent("DyLabel").setText(str);
        this.scheduleOnce(function() {
          this.boxlabel.active = false;
        }.bind(this), .5);
      }
    });
    cc._RF.pop();
  }, {} ],
  camera: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "76318cmQJZOdaCO3bT4ziCW", "camera");
    "use strict";
    var Camera = {
      max: 1.2,
      min: 1,
      idleTime: 3
    };
    cc.Class({
      extends: cc.Component,
      properties: {
        mainCamera: cc.Camera
      },
      onLoad: function onLoad() {
        this.canvas = cc.find("Canvas");
      },
      updateCamera: function updateCamera(dt) {
        var x = this.mainCamera.node.x - this.node.x;
        var y = this.mainCamera.node.y - this.node.y;
        x = Math.abs(x) > 100 ? x : 0;
        y = Math.abs(y) > 100 ? y : 0;
        var x1 = this.mainCamera.node.x - x / 60;
        var y1 = this.mainCamera.node.y - y / 60;
        this.mainCamera.node.x = x1;
        this.mainCamera.node.y = y1;
      },
      update: function update(dt) {
        this.updateCamera(dt);
      }
    });
    cc._RF.pop();
  }, {} ],
  en: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "46419NkJsNKuJo1gS4QALVU", "en");
    "use strict";
    module.exports = {
      current: "Current language: ",
      create_language: "New language",
      language: "Language",
      create: "Create",
      cancel: "Cancel",
      nav_home: "Home",
      nav_box: "Box",
      nav_nft: "NFT",
      nav_defi: "DeFi",
      nav_store: "Store",
      nav_risk: "Risk",
      tip_systoptit: "System suspended",
      tip_systop: "System suspended, please visit later.",
      tip_nonetit: "Under development",
      tip_none: "It has not been launched yet, please look forward to it.",
      tip_selltit: "Sell successfully",
      tip_sell: "The NFT has been sold successfully. The specific situation shall be based on the data on the chain.",
      tip_claimtit: "Claim successfully",
      tip_claim: "Has successfully received the earnings\u3002The specific situation shall be based on the data on the chain.",
      tip_staketit: "Stake successfully",
      tip_stake: "Has successfully staked the NFT\u3002The specific situation shall be based on the data on the chain.",
      tip_unstaketit: "Unstake successfully",
      tip_unstake: "Has successfully unstaked the NFT\u3002The specific situation shall be based on the data on the chain.",
      info_pricetit: "Blindbox price",
      info_price: "The first five thousand blind boxes are fixed as 5EOS, and then the price of the blind box will change linearly with the heat of the market. The rock bottom price is 5EOS, and every time one is sold, the price increases by 0.1EOS; if no one buys it, it lowers 0.1EOS every hour.",
      tip_failtit: "Transaction failed",
      tip_fail: "Make sure you have sufficient RAM, CPU, Net resources or EOS.",
      box_open: "Open all",
      hero_cate: "Cate:",
      hero_sell: "Sell",
      hero_buy: "Buy",
      hero_upgrade: "Upgrade",
      hero_merge: "Merge",
      hero_stake: "Stake",
      hero_uptip: "Need to destroy the same category of NFT, and it is lossy.",
      defi_claim: "Claim",
      defi_earnings: "Estimated earnings",
      defi_equip: "Equip",
      defi_remove: "Remove",
      defi_unstake: "Unstake",
      defi_stake: "Stake"
    };
    cc._RF.pop();
  }, {} ],
  heroPanelUI: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "e9705Nd5ppNQ5Gt7lKoW5yA", "heroPanelUI");
    "use strict";
    var cates = [ {
      zh_HK: "\u7a7a",
      en: "None"
    }, {
      zh_HK: "\u91d1",
      en: "Gold"
    }, {
      zh_HK: "\u6728",
      en: "Wood"
    }, {
      zh_HK: "\u6c34",
      en: "Water"
    }, {
      zh_HK: "\u706b",
      en: "Fire"
    }, {
      zh_HK: "\u571f",
      en: "Ground"
    } ];
    var pid;
    var tid;
    var slot;
    cc.Class({
      extends: cc.Component,
      properties: {
        title: cc.Label,
        nftid: cc.Label,
        nftvalue: cc.Label,
        nftprice: cc.Label,
        level: cc.Label,
        genes: cc.Label,
        att: cc.Label,
        des: cc.Label,
        mdata: cc.Label,
        sfAttributes: {
          default: [],
          type: cc.SpriteFrame
        },
        spAttribute: {
          default: null,
          type: cc.Sprite
        }
      },
      updatePanelDate: function updatePanelDate(herodata) {
        var lang = "en";
        var langLocal = cc.sys.localStorage.getItem("curLang");
        langLocal && (lang = langLocal);
        var cate = "en" == lang ? cates[herodata.category].en : cates[herodata.category].zh_HK;
        this.title.string = herodata.token_name;
        this.nftid.string = herodata.id;
        this.nftvalue.string = herodata.nft_value;
        this.level.string = herodata.level;
        this.genes.string = herodata.genes;
        this.att.string = cate;
        this.des.string = herodata.token_summary;
        this.mdata.string = herodata.mdata;
        this.spAttribute.spriteFrame = this.sfAttributes[herodata.category];
        tid = herodata.id;
        if (void 0 != herodata.price) {
          this.price = herodata.price;
          this.nftprice.string = herodata.price;
        }
        cc.sys.localStorage.setItem("HeroDataCurrent", JSON.stringify(herodata));
      },
      setSlot: function setSlot(slot) {
        this.slot = slot;
        console.log("slot:" + this.slot);
      },
      buyHero: function buyHero() {
        if (!price) return;
        pid = 1;
        cc.find("CCC").getComponent("CCCManager").buyHero(pid, tid, price);
      },
      sellHero: function sellHero() {
        if (!price) return;
        pid = 1;
        cc.find("CCC").getComponent("CCCManager").sellHero(pid, tid, price);
      },
      stakeHero: function stakeHero() {
        cc.find("CCC").getComponent("CCCManager").stakeHero(tid);
      },
      unstakeHero: function unstakeHero() {
        console.log("slot:" + this.slot);
        cc.find("CCC").getComponent("CCCManager").unstakeHero(this.slot);
      }
    });
    cc._RF.pop();
  }, {} ],
  hero: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "74be9udA3FFSIKIjQf6NJQI", "hero");
    "use strict";
    var ANI_GROUP = "normal";
    var ATTANILIST = [ "att_1", "att_2", "att_3", "att_4" ];
    var SKINLIST = [ "player" ];
    cc.Class({
      extends: cc.Component,
      properties: {
        leftButton: cc.Node,
        rightButton: cc.Node,
        hpBar: cc.Node,
        blackNode: cc.Node
      },
      onLoad: function onLoad() {
        this.dbDisplay = this.node.getComponent(dragonBones.ArmatureDisplay);
        this.dbArmature = this.dbDisplay.armature();
        this.defSkinId = 0;
        this.wepDisplay = cc.find("sword").getComponent(dragonBones.ArmatureDisplay);
        this.eyeDisplay = cc.find("eyes").getComponent(dragonBones.ArmatureDisplay);
        this.node.zIndex = 2;
        this.node.isDie = false;
        this._speed = 0;
        this.moveSpeed = 200;
        this._faceDir = 1;
        this._onButton = false;
        this.game = this.node.parent.getComponent("game");
        this.attCount = 0;
        this.node.cW = {
          x: this.node.width / 2,
          y: this.node.height
        };
        this.dbDisplay.on(dragonBones.EventObject.COMPLETE, this.aniComplete, this);
        this.dbDisplay.on(dragonBones.EventObject.FRAME_EVENT, this.frameEvent, this);
        this.setEvent();
        this.init();
      },
      init: function init() {
        this.ROLE = {
          att: 30,
          wepId: 0,
          hp: 200,
          totalHp: 200,
          dodgeLen: 200,
          dodgeSpeed: 20
        };
        this.idleAni();
        this.updateWep();
        console.log(this.node.name);
        this.updateHandr();
      },
      updateHero: function updateHero(herodata) {
        var gene = this.string_to_arr(herodata.genes);
        this.updateSkin(gene[0]);
        this.dbArmature.getSlot("slot_hair").displayIndex = gene[2];
        this.dbArmature.getSlot("slot_item").displayIndex = gene[4];
        this.updateHat(gene[1]);
        this.updateEye(gene[3]);
        this.updateBody(gene[5]);
        this.updateArmL(gene[6]);
        this.updateArmR(gene[7]);
        this.updateHand(gene[8]);
        this.updateLegL(gene[9]);
        this.updateLegR(gene[10]);
        this.updateFoot(gene[11]);
        this.updateWing(herodata.category, herodata.level);
        this.updateWep();
      },
      changeSkin: function changeSkin() {
        if (this.node.isDie) return;
        this.defSkinId = this.defSkinId < SKINLIST.length - 1 ? this.defSkinId + 1 : 0;
        var skinName = SKINLIST[this.defSkinId];
        this.dbDisplay.armatureName = skinName;
        this.dbArmature = this.dbDisplay.armature();
        this.updateWep();
      },
      changeWep: function changeWep() {
        if (0 != this.defSkinId || this.node.isDie) return;
        var wepId = Math.floor(20 * Math.random());
        this.ROLE.wepId = wepId;
        this.updateWep();
      },
      updateWep: function updateWep() {
        if (0 != this.defSkinId) return;
        var wep = this.wepDisplay.buildArmature("s_" + this.ROLE.wepId);
        this.dbArmature.getSlot("weapon").childArmature = wep.armature();
        var wepFxId = "fx" + (Math.floor(9 * Math.random()) + 1);
        wep.playAnimation(wepFxId);
      },
      string_to_arr: function string_to_arr(str) {
        var charmap = ".12345abcdefghijklmnopqrstuvwxyz";
        var gene = new Array();
        for (var i = 0; i < 12; ++i) gene[i] = charmap.indexOf(str.charAt(i));
        return gene;
      },
      updateHandr: function updateHandr() {
        if (0 != this.defSkinId) return;
        this.dbArmature.getSlot("slot_hair").displayIndex = Math.floor(31 * Math.random());
        this.dbArmature.getSlot("slot_item").displayIndex = Math.floor(31 * Math.random());
        this.dbArmature.getSlot("slot_body_1").displayIndex = 0;
        this.dbArmature.getSlot("slot_body_2").displayIndex = 0;
        this.dbArmature.getSlot("slot_foot_r").displayIndex = 1;
        this.dbArmature.getSlot("slot_foot_l").displayIndex = 1;
        var ey = Math.floor(6 * Math.random());
        var sk = Math.floor(4 * Math.random());
        this.updateEye(ey);
        this.updateSkin(sk);
        this.updateWing(0, 6);
        var ha = Math.floor(32 * Math.random());
        this.updateHat(0);
        this.updateBody(ha);
        var al = Math.floor(32 * Math.random());
        var ar = Math.floor(32 * Math.random());
        this.updateArmL(al);
        this.updateArmR(ar);
        this.updateLegL(al);
        this.updateLegR(ar);
        this.updateFoot(ar);
      },
      updateSkin: function updateSkin(s) {
        var parts = [ "skin_head", "skin_ear", "skin_body_1", "skin_body_2", "skin_neck", "skin_arm_1_r", "skin_arm_2_r", "skin_hand_r", "skin_arm_1_l", "skin_arm_2_l", "skin_hand_l", "skin_hip", "skin_leg_1_r", "skin_leg_2_r", "skin_foot_r", "skin_leg_1_l", "skin_leg_2_l", "skin_foot_l" ];
        for (var i = 0; i < parts.length; i++) this.dbArmature.getSlot(parts[i]).displayIndex = s;
      },
      updateHat: function updateHat(s) {
        this.dbArmature.getSlot("slot_hat").displayIndex = void 0;
        if (0 != s) {
          this.dbArmature.getSlot("slot_hat").displayIndex = s - 1;
          this.dbArmature.getSlot("slot_hair").displayIndex = void 0;
          this.dbArmature.getSlot("slot_item").displayIndex = void 0;
        }
      },
      updateEye: function updateEye(s) {
        var eyes = this.eyeDisplay.buildArmature("e_" + s);
        eyes.timeScale = (s + 1) / 3;
        this.dbArmature.getSlot("skin_eyes").childArmature = eyes.armature();
      },
      updateBody: function updateBody(s) {
        if (0 == s) {
          this.dbArmature.getSlot("slot_body_1").displayIndex = void 0;
          this.dbArmature.getSlot("slot_body_2").displayIndex = void 0;
        } else if (s <= 8) {
          this.dbArmature.getSlot("slot_body_1").displayIndex = s - 1;
          this.dbArmature.getSlot("slot_body_2").displayIndex = s - 1;
        } else {
          this.dbArmature.getSlot("slot_body_1").displayIndex = Math.floor(s / 4);
          this.dbArmature.getSlot("slot_body_2").displayIndex = s % 8;
        }
      },
      updateArmL: function updateArmL(s) {
        if (0 == s) {
          this.dbArmature.getSlot("slot_arm_1_l").displayIndex = void 0;
          this.dbArmature.getSlot("slot_arm_2_l").displayIndex = void 0;
        } else if (s <= 8) {
          this.dbArmature.getSlot("slot_arm_1_l").displayIndex = s - 1;
          this.dbArmature.getSlot("slot_arm_2_l").displayIndex = s - 1;
        } else {
          this.dbArmature.getSlot("slot_arm_1_l").displayIndex = Math.floor(s / 4);
          this.dbArmature.getSlot("slot_arm_2_l").displayIndex = s % 8;
        }
      },
      updateArmR: function updateArmR(s) {
        if (0 == s) {
          this.dbArmature.getSlot("slot_arm_1_r").displayIndex = void 0;
          this.dbArmature.getSlot("slot_arm_2_r").displayIndex = void 0;
        } else if (s <= 8) {
          this.dbArmature.getSlot("slot_arm_1_r").displayIndex = s - 1;
          this.dbArmature.getSlot("slot_arm_2_r").displayIndex = s - 1;
        } else {
          this.dbArmature.getSlot("slot_arm_1_r").displayIndex = Math.floor(s / 4);
          this.dbArmature.getSlot("slot_arm_2_r").displayIndex = s % 8;
        }
      },
      updateHand: function updateHand(s) {
        if (0 == s) {
          this.dbArmature.getSlot("slot_hand_l").displayIndex = void 0;
          this.dbArmature.getSlot("slot_hand_r").displayIndex = void 0;
        } else if (s <= 8) {
          this.dbArmature.getSlot("slot_hand_l").displayIndex = s - 1;
          this.dbArmature.getSlot("slot_hand_r").displayIndex = s - 1;
        } else {
          this.dbArmature.getSlot("slot_hand_l").displayIndex = Math.floor(s / 4);
          this.dbArmature.getSlot("slot_hand_r").displayIndex = s % 8;
        }
      },
      updateLegL: function updateLegL(s) {
        if (s < 8) {
          this.dbArmature.getSlot("slot_hip").displayIndex = s;
          this.dbArmature.getSlot("slot_leg_1_l").displayIndex = s;
          this.dbArmature.getSlot("slot_leg_2_l").displayIndex = s;
        } else if (s < 16) {
          this.dbArmature.getSlot("slot_hip").displayIndex = Math.floor(s / 4);
          this.dbArmature.getSlot("slot_leg_1_l").displayIndex = Math.floor(s / 4);
          this.dbArmature.getSlot("slot_leg_2_l").displayIndex = void 0;
        } else {
          this.dbArmature.getSlot("slot_hip").displayIndex = Math.floor(s / 4);
          this.dbArmature.getSlot("slot_leg_1_l").displayIndex = Math.floor(s / 4);
          this.dbArmature.getSlot("slot_leg_2_l").displayIndex = s % 8;
        }
      },
      updateLegR: function updateLegR(s) {
        if (s < 8) {
          this.dbArmature.getSlot("slot_leg_1_r").displayIndex = s;
          this.dbArmature.getSlot("slot_leg_2_r").displayIndex = s;
        } else if (s < 16) {
          this.dbArmature.getSlot("slot_leg_1_r").displayIndex = Math.floor(s / 4);
          this.dbArmature.getSlot("slot_leg_2_r").displayIndex = void 0;
        } else {
          this.dbArmature.getSlot("slot_leg_1_r").displayIndex = Math.floor(s / 4);
          this.dbArmature.getSlot("slot_leg_2_r").displayIndex = s % 8;
        }
      },
      updateFoot: function updateFoot(s) {
        if (0 == s) {
          this.dbArmature.getSlot("slot_foot_l").displayIndex = void 0;
          this.dbArmature.getSlot("slot_foot_r").displayIndex = void 0;
        } else if (s <= 8) {
          this.dbArmature.getSlot("slot_foot_l").displayIndex = s - 1;
          this.dbArmature.getSlot("slot_foot_r").displayIndex = s - 1;
        } else {
          this.dbArmature.getSlot("slot_foot_l").displayIndex = Math.floor(s / 4);
          this.dbArmature.getSlot("slot_foot_r").displayIndex = s % 8;
        }
      },
      updateWing: function updateWing(s, l) {
        var parts = [ "slot_wing_1_r", "slot_wing_1_l", "slot_wing_2_r", "slot_wing_2_l", "slot_wing_3_r", "slot_wing_3_l" ];
        for (var i = 0; i < parts.length; i++) this.dbArmature.getSlot(parts[i]).displayIndex = s;
        if (l < 5) {
          var m = 5 - l;
          for (var _i = 0; _i < m; _i++) this.dbArmature.getSlot(parts[_i]).displayIndex = void 0;
        }
      },
      aniComplete: function aniComplete(e) {
        if (this.node.isDie) return;
        this._onButton ? this.attackAni() : this.idleAni();
      },
      frameEvent: function frameEvent(e) {
        if (this.node.isDie) return;
        "attack" == e.name;
      },
      setEvent: function setEvent() {
        this.node.parent.on("touchstart", this.touchStart, this);
        this.node.parent.on("touchend", this.touchEnd, this);
        this.node.parent.on("touchcancel", this.touchCancel, this);
      },
      offEvent: function offEvent() {
        this.node.parent.off("touchstart", this.touchStart, this);
        this.node.parent.off("touchend", this.touchEnd, this);
        this.node.parent.off("touchcancel", this.touchCancel, this);
      },
      touchStart: function touchStart(e) {
        this._onButton = true;
        var name = e.target.name;
        var dir = "left" == name ? 1 : -1;
        this.dbDisplay.playAnimation("die");
        this._faceDir = dir;
        this._speed = this.moveSpeed * dir;
        this.node.scaleX = dir;
        this.dbArmature.animation.fadeIn("move", -1, -1, 0, ANI_GROUP);
      },
      dodge: function dodge(dir) {
        var _this = this;
        this.dbArmature.animation.fadeIn("avoid", -1, -1, 0, ANI_GROUP);
        this.blackNode.active = true;
        var len = cc.Vec2.distance(this.node.position, cc.v2(this.boundary * dir, 0));
        len = len < this.ROLE.dodgeLen ? len : this.ROLE.dodgeLen;
        cc.tween(this.node).by(.2, {
          position: cc.v2(len * dir, 0)
        }).call(function() {
          _this.blackNode.active = false;
          _this.idleAni();
        }).start();
      },
      touchEnd: function touchEnd(e) {
        this._onButton = false;
        this._speed = 0;
      },
      touchCancel: function touchCancel(e) {
        this._onButton = false;
        var endY = e.getStartLocation().y - e.getLocation().y;
        console.log(endY);
        if (endY > 0) console.log("down"); else {
          console.log("up");
          this.lv = this.node.getComponent(cc.RigidBody).linearVelocity;
          this.lv.y = 300;
          this.node.getComponent(cc.RigidBody).linearVelocity = this.lv;
        }
        this._speed = 0;
      },
      idleAni: function idleAni() {
        if (this.node.isDie) return;
        this.dbArmature.animation.fadeIn("idle", -1, -1, 0, ANI_GROUP, dragonBones.AnimationFadeOutMode.All);
      },
      attackAni: function attackAni() {
        if (this.node.isDie) return;
        var attName = ATTANILIST[this.attCount];
        this.dbArmature.animation.fadeIn(attName, -1, -1, 0, ANI_GROUP);
        this.attCount = this.attCount < 3 ? this.attCount + 1 : 0;
      },
      uatt: function uatt(att) {
        if (this.node.isDie) return;
        var hp = this.ROLE.hp - att;
        this.game.showHit(att, cc.v2(this.node.x, this.node.y + this.node.height));
        if (hp <= 0) {
          this.node.isDie = true;
          this.offEvent(this.leftButton);
          this.offEvent(this.rightButton);
          this.dbDisplay.off(dragonBones.EventObject.COMPLETE, this.aniComplete, this);
          this.dbDisplay.off(dragonBones.EventObject.FRAME_EVENT, this.frameEvent, this);
          this.ROLE.hp = 0;
          this.hpBar.width = 0;
          this.dbDisplay.playAnimation("die");
          return;
        }
        this.hpBar.width = hp / this.ROLE.totalHp * 200;
        this.ROLE.hp = hp;
      },
      invincible: function invincible(bool) {
        this.node.getComponents(cc.Collider)[0].enabled = bool;
      },
      move: function move() {},
      update: function update(dt) {
        if (this.node.isDie) return;
        0 != this._speed && this.move();
      }
    });
    cc._RF.pop();
  }, {} ],
  lang: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "9c976I235RPkKlUSj0oxbVx", "lang");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {},
      onLoad: function onLoad() {},
      start: function start() {},
      changeLanguage: function changeLanguage(event, customEventData) {
        this.i18n = require("LanguageData");
        if (customEventData === window.i18n.curLang) return;
        this.i18n.init(customEventData);
        this.i18n.updateSceneRenderers();
        window.i18n.curLang = customEventData;
        cc.sys.localStorage.setItem("curLang", customEventData);
      }
    });
    cc._RF.pop();
  }, {
    LanguageData: "LanguageData"
  } ],
  message: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "95574VrxSdPEp3OvmCe+y4K", "message");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        marqueeLabel: cc.Label,
        mask: cc.Node
      },
      onLoad: function onLoad() {
        this.descs = [];
        this.marqeeIndex = 0;
        this.marqueeBg = this.node;
        this.marqueeBg.opacity = 0;
      },
      setMsg: function setMsg(messages) {
        this.descs = messages;
      },
      update: function update() {
        try {
          var endIndex = this.descs.length - 1;
          var desc = this.descs[endIndex];
          if (desc) {
            this.runMarqeeBar(desc);
            this.descs[endIndex] = null;
          }
        } catch (e) {}
      },
      runMarqeeBar: function runMarqeeBar(desc) {
        var _this = this;
        this.marqueeBg.opacity = 255;
        this.marqueeLabel.node.x = this.mask.width;
        this.marqueeLabel.string = desc;
        this.marqueeLabel.node.runAction(cc.sequence(cc.moveTo(30, -this.marqueeLabel.node.width, 0), cc.callFunc(function() {
          _this.descs.pop();
          _this.isExistContent() || _this.descs.unshift(_this.desc1);
        }, this, this)));
      },
      isExistContent: function isExistContent() {
        if (this.descs[this.descs.length - 1]) return true;
        return false;
      }
    });
    cc._RF.pop();
  }, {} ],
  "polyglot.min": [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "e26fd9yy65A4q3/JkpVnFYg", "polyglot.min");
    "use strict";
    (function(e, t) {
      "function" == typeof define && define.amd ? define([], function() {
        return t(e);
      }) : "object" == typeof exports ? module.exports = t(e) : e.Polyglot = t(e);
    })(void 0, function(e) {
      function t(e) {
        e = e || {}, this.phrases = {}, this.extend(e.phrases || {}), this.currentLocale = e.locale || "en", 
        this.allowMissing = !!e.allowMissing, this.warn = e.warn || c;
      }
      function s(e) {
        var t, n, r, i = {};
        for (t in e) if (e.hasOwnProperty(t)) {
          n = e[t];
          for (r in n) i[n[r]] = t;
        }
        return i;
      }
      function o(e) {
        var t = /^\s+|\s+$/g;
        return e.replace(t, "");
      }
      function u(e, t, r) {
        var i, s, u;
        return null != r && e ? (s = e.split(n), u = s[f(t, r)] || s[0], i = o(u)) : i = e, 
        i;
      }
      function a(e) {
        var t = s(i);
        return t[e] || t.en;
      }
      function f(e, t) {
        return r[a(e)](t);
      }
      function l(e, t) {
        for (var n in t) "_" !== n && t.hasOwnProperty(n) && (e = e.replace(new RegExp("%\\{" + n + "\\}", "g"), t[n]));
        return e;
      }
      function c(t) {
        e.console && e.console.warn && e.console.warn("WARNING: " + t);
      }
      function h(e) {
        var t = {};
        for (var n in e) t[n] = e[n];
        return t;
      }
      t.VERSION = "0.4.3", t.prototype.locale = function(e) {
        return e && (this.currentLocale = e), this.currentLocale;
      }, t.prototype.extend = function(e, t) {
        var n;
        for (var r in e) e.hasOwnProperty(r) && (n = e[r], t && (r = t + "." + r), "object" == typeof n ? this.extend(n, r) : this.phrases[r] = n);
      }, t.prototype.clear = function() {
        this.phrases = {};
      }, t.prototype.replace = function(e) {
        this.clear(), this.extend(e);
      }, t.prototype.t = function(e, t) {
        var n, r;
        return t = null == t ? {} : t, "number" == typeof t && (t = {
          smart_count: t
        }), "string" == typeof this.phrases[e] ? n = this.phrases[e] : "string" == typeof t._ ? n = t._ : this.allowMissing ? n = e : (this.warn('Missing translation for key: "' + e + '"'), 
        r = e), "string" == typeof n && (t = h(t), r = u(n, this.currentLocale, t.smart_count), 
        r = l(r, t)), r;
      }, t.prototype.has = function(e) {
        return e in this.phrases;
      };
      var n = "||||", r = {
        chinese: function chinese(e) {
          return 0;
        },
        german: function german(e) {
          return 1 !== e ? 1 : 0;
        },
        french: function french(e) {
          return e > 1 ? 1 : 0;
        },
        russian: function russian(e) {
          return e % 10 === 1 && e % 100 !== 11 ? 0 : e % 10 >= 2 && e % 10 <= 4 && (e % 100 < 10 || e % 100 >= 20) ? 1 : 2;
        },
        czech: function czech(e) {
          return 1 === e ? 0 : e >= 2 && e <= 4 ? 1 : 2;
        },
        polish: function polish(e) {
          return 1 === e ? 0 : e % 10 >= 2 && e % 10 <= 4 && (e % 100 < 10 || e % 100 >= 20) ? 1 : 2;
        },
        icelandic: function icelandic(e) {
          return e % 10 !== 1 || e % 100 === 11 ? 1 : 0;
        }
      }, i = {
        chinese: [ "fa", "id", "ja", "ko", "lo", "ms", "th", "tr", "zh" ],
        german: [ "da", "de", "en", "es", "fi", "el", "he", "hu", "it", "nl", "no", "pt", "sv" ],
        french: [ "fr", "tl", "pt-br" ],
        russian: [ "hr", "ru" ],
        czech: [ "cs" ],
        polish: [ "pl" ],
        icelandic: [ "is" ]
      };
      return t;
    });
    cc._RF.pop();
  }, {} ],
  upgradePanel: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "b2938IN11dAPLuPK5tVh07/", "upgradePanel");
    "use strict";
    var HeroData = [];
    var HeroDataAll = [];
    var HeroDataCate = [];
    var cateValue = 999;
    var nftDir = 999;
    var HeroDataCurrent;
    var mid;
    var upIDs = [];
    var pageSlots = 36;
    var page;
    var pageAll;
    var heroSlotCur;
    cc.Class({
      extends: cc.Component,
      properties: {
        slotPrefab: {
          default: null,
          type: cc.Prefab
        },
        scrollView: {
          default: null,
          type: cc.ScrollView
        },
        mainHero: cc.Node,
        btnPre: cc.Node,
        btnNext: cc.Node
      },
      addMidHeroSlot: function addMidHeroSlot(herodata) {
        var heroSlotC = cc.instantiate(this.slotPrefab);
        this.mainHero.addChild(heroSlotC);
        heroSlotC.getComponent("HeroSlot").updateHeroslot(herodata.genes);
        heroSlotC.getComponent("HeroSlot").refresh(herodata);
        return heroSlotC;
      },
      addHeroSlot: function addHeroSlot(i) {
        var heroSlot = cc.instantiate(this.slotPrefab);
        this.scrollView.content.addChild(heroSlot);
        heroSlot.getComponent("HeroSlot").updateHeroslot(HeroData[i].genes);
        heroSlot.getComponent("HeroSlot").refresh(HeroData[i]);
        var clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = this.node;
        clickEventHandler.component = "upgradePanel";
        clickEventHandler.handler = "onClickItem";
        clickEventHandler.customEventData = {
          index: i
        };
        var button = heroSlot.getComponent("HeroSlot").dbbutton;
        button.clickEvents.push(clickEventHandler);
        return heroSlot;
      },
      onClickItem: function onClickItem(event, customEventData) {
        var node = event.target;
        var index = customEventData.index;
        if (upIDs.includes(HeroData[index].id)) {
          this.heroSlots[index].getChildByName("btn_dot").active = false;
          upIDs = upIDs.filter(function(item) {
            return item != HeroData[index].id;
          });
        } else if (upIDs.length < 16) {
          this.heroSlots[index].getChildByName("btn_dot").active = true;
          upIDs.push(HeroData[index].id);
        }
        console.log(upIDs);
      },
      show: function show() {
        upIDs = [];
        var heroDataCurrentLocal = cc.sys.localStorage.getItem("HeroDataCurrent");
        HeroDataCurrent = JSON.parse(heroDataCurrentLocal);
        cateValue = HeroDataCurrent.category;
        mid = HeroDataCurrent.id;
        var heroSlotCurrent = this.addMidHeroSlot(HeroDataCurrent);
        this.heroSlotCur = heroSlotCurrent;
        var heroDataLocal = cc.sys.localStorage.getItem("HeroData");
        heroDataLocal && (HeroDataAll = JSON.parse(heroDataLocal));
        HeroDataCate = HeroDataAll.filter(function(item) {
          return item.category == cateValue;
        });
        HeroDataCate = HeroDataCate.filter(function(item) {
          return item.id != mid;
        });
        page = 1;
        pageAll = parseInt(HeroDataCate.length / pageSlots) + 1;
        HeroData = HeroDataCate.slice(0, pageSlots);
        this.checkPage();
        this.heroSlots = [];
        for (var i = 0; i < HeroData.length; ++i) {
          var heroSlot = this.addHeroSlot(i);
          upIDs.includes(HeroData[i].id) && (heroSlot.getChildByName("btn_dot").active = true);
          this.heroSlots.push(heroSlot);
        }
        this.node.active = true;
        this.node.emit("fade-in");
      },
      hide: function hide() {
        if (this.heroSlots) {
          for (var i = 0; i < this.heroSlots.length; ++i) this.heroSlots[i].destroy();
          this.heroSlotCur.destroy();
        }
        this.node.emit("fade-out");
      },
      checkPage: function checkPage() {
        this.btnPre.active = page > 1;
        this.btnNext.active = pageAll > page;
      },
      goToNext: function goToNext() {
        for (var i = 0; i < this.heroSlots.length; ++i) this.heroSlots[i].destroy();
        page += 1;
        HeroData = HeroDataCate.slice(pageSlots * (page - 1), pageSlots * page);
        this.checkPage();
        this.heroSlots = [];
        console.log(HeroData);
        for (var _i = 0; _i < HeroData.length; ++_i) {
          var heroSlot = this.addHeroSlot(_i);
          upIDs.includes(HeroData[_i].id) && (heroSlot.getChildByName("btn_dot").active = true);
          this.heroSlots.push(heroSlot);
        }
      },
      goToPre: function goToPre() {
        for (var i = 0; i < this.heroSlots.length; ++i) this.heroSlots[i].destroy();
        page -= 1;
        HeroData = HeroDataCate.slice(pageSlots * (page - 1), pageSlots * page);
        this.checkPage();
        this.heroSlots = [];
        for (var _i2 = 0; _i2 < HeroData.length; ++_i2) {
          var heroSlot = this.addHeroSlot(_i2);
          upIDs.includes(HeroData[_i2].id) && (heroSlot.getChildByName("btn_dot").active = true);
          this.heroSlots.push(heroSlot);
        }
      },
      sortDate: function sortDate(event, dir) {
        if (nftDir == dir) return;
        nftDir = dir;
        for (var i = 0; i < this.heroSlots.length; ++i) this.heroSlots[i].destroy();
        HeroDataCate = 1 == dir ? HeroDataCate.sort(function(x, y) {
          return parseFloat(x["nft_value"]) - parseFloat(y["nft_value"]);
        }) : HeroDataCate.sort(function(x, y) {
          return parseFloat(x["nft_value"]) - parseFloat(y["nft_value"]);
        }).reverse();
        page = 1;
        HeroData = HeroDataCate.slice(0, pageSlots);
        this.checkPage();
        this.heroSlots = [];
        for (var _i3 = 0; _i3 < HeroData.length; ++_i3) {
          var heroSlot = this.addHeroSlot(_i3);
          upIDs.includes(HeroData[_i3].id) && (heroSlot.getChildByName("btn_dot").active = true);
          this.heroSlots.push(heroSlot);
        }
      },
      upgrade: function upgrade() {
        cc.find("CCC").getComponent("CCCManager").upgrade("herobox.ccc", mid, upIDs);
      }
    });
    cc._RF.pop();
  }, {} ],
  use_reversed_rotateBy: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "84a69TC3olAWputa74dQNL5", "use_reversed_rotateBy");
    "use strict";
    cc.RotateBy._reverse = true;
    cc._RF.pop();
  }, {} ],
  use_reversed_rotateTo: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "175723Wd0hF54LTbMzfvy4J", "use_reversed_rotateTo");
    "use strict";
    cc.RotateTo._reverse = true;
    cc._RF.pop();
  }, {} ],
  "use_v2.1-2.2.1_cc.Toggle_event": [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "717fdCQYqVNlqoEU50uXboH", "use_v2.1-2.2.1_cc.Toggle_event");
    "use strict";
    cc.Toggle && (cc.Toggle._triggerEventInScript_isChecked = true);
    cc._RF.pop();
  }, {} ],
  "use_v2.1.x_cc.Action": [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "70014gVuQ1IMLvafpl/+4a9", "use_v2.1.x_cc.Action");
    "use strict";
    cc.macro.ROTATE_ACTION_CCW = true;
    cc._RF.pop();
  }, {} ],
  zh: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "01b0a3AYrJCRKUQX2C/M3Gf", "zh");
    "use strict";
    module.exports = {
      current: "\u5f53\u524d\u8bed\u8a00\uff1a",
      create_language: "\u521b\u5efa\u65b0\u8bed\u8a00",
      language: "\u8bed\u8a00\u540d\u79f0",
      create: "\u521b\u5efa",
      cancel: "\u53d6\u6d88",
      nav_home: "\u9996\u9875",
      nav_box: "\u76f2\u76d2",
      nav_nft: "NFT",
      nav_defi: "DeFi",
      nav_store: "\u5e02\u573a",
      nav_risk: "\u5192\u9669",
      tip_systoptit: "\u7cfb\u7edf\u6682\u505c",
      tip_systop: "\u7cfb\u7edf\u6682\u505c\uff0c\u8bf7\u7a0d\u5019\u8bbf\u95ee\u3002",
      tip_nonetit: "\u5f00\u53d1\u4e2d",
      tip_none: "\u6682\u672a\u63a8\u51fa\uff0c\u656c\u8bf7\u671f\u5f85\u3002",
      tip_selltit: "\u9500\u552e\u6210\u529f",
      tip_sell: "\u8be5NFT\u5df2\u7ecf\u6210\u529f\u9500\u552e\u3002\u5177\u4f53\u60c5\u51b5\u4ee5\u94fe\u4e0a\u6570\u636e\u4e3a\u51c6\u3002",
      tip_claimtit: "\u9886\u53d6\u6210\u529f",
      tip_claim: "\u5df2\u7ecf\u6210\u529f\u9886\u53d6\u6536\u76ca\u3002\u5177\u4f53\u60c5\u51b5\u4ee5\u94fe\u4e0a\u6570\u636e\u4e3a\u51c6\u3002",
      tip_staketit: "\u8d28\u62bc\u6210\u529f",
      tip_stake: "\u5df2\u7ecf\u6210\u529f\u8d28\u62bcNFT\u3002\u5177\u4f53\u60c5\u51b5\u4ee5\u94fe\u4e0a\u6570\u636e\u4e3a\u51c6\u3002",
      tip_unstaketit: "\u89e3\u9664\u8d28\u62bc",
      tip_unstake: "\u5df2\u7ecf\u6210\u529f\u53d6\u56deNFT\u3002\u5177\u4f53\u60c5\u51b5\u4ee5\u94fe\u4e0a\u6570\u636e\u4e3a\u51c6\u3002",
      info_pricetit: "\u76f2\u76d2\u4ef7\u683c",
      info_price: "\u524d\u4e94\u5343\u4e2a\u76f2\u76d2\u56fa\u5b9a\u4e3a5EOS\uff0c\u4e4b\u540e\u76f2\u76d2\u4ef7\u683c\u4f1a\u968f\u7740\u5e02\u573a\u70ed\u5ea6\u800c\u7ebf\u6027\u53d8\u5316\u3002\u5e95\u4ef7\u662f5EOS\uff0c\u6bcf\u5356\u51fa\u4e00\u4e2a\uff0c\u4ef7\u683c\u589e\u52a00.1EOS\uff1b\u5982\u679c\u65e0\u4eba\u8d2d\u4e70\uff0c\u6bcf\u96941\u5c0f\u65f6\u4f1a\u964d\u4f4e0.1EOS\u3002",
      tip_failtit: "\u63d0\u4ea4\u4e8b\u52a1\u5931\u8d25",
      tip_fail: "\u8bf7\u786e\u4fdd\u6709\u8db3\u591f\u7684RAM\u3001CPU\u3001Net\u8d44\u6e90\u6216EOS\u3002",
      box_open: "\u4e00\u952e\u6253\u5f00",
      hero_cate: "\u5c5e\u6027\uff1a",
      hero_sell: "\u51fa\u552e",
      hero_buy: "\u8d2d\u4e70",
      hero_upgrade: "\u5347\u7ea7",
      hero_merge: "\u7194\u70bc",
      hero_stake: "\u8d28\u62bc",
      hero_uptip: "\u5347\u7ea7NFT\uff0c\u9700\u9500\u6bc1\u540c\u7c7b\u522b\u7684NFT\uff0c\u5e76\u6709\u635f\u8017",
      defi_claim: "\u9886\u53d6",
      defi_earnings: "\u9884\u4f30\u6536\u76ca",
      defi_equip: "\u88c5\u5907",
      defi_remove: "\u5378\u4e0b",
      defi_unstake: "\u53d6\u56de",
      defi_stake: "\u8d28\u62bc"
    };
    cc._RF.pop();
  }, {} ]
}, {}, [ "DyLabel", "ItemList", "ItemTemplate", "en", "zh", "use_reversed_rotateBy", "use_reversed_rotateTo", "use_v2.1-2.2.1_cc.Toggle_event", "use_v2.1.x_cc.Action", "LanguageData", "LocalizedLabel", "LocalizedSprite", "SpriteFrameSet", "polyglot.min", "BossMng", "Foe", "Move", "Player", "Projectile", "Spawn", "WaveMng", "hero", "AnimHelper", "BGPool", "BackPackUI", "BoxUI", "ButtonScaler", "CCCManager", "ChargeUI", "DefiUI", "EnergyCounter", "Game", "HeroSlot", "HomeUI", "NodePool", "PanelTransition", "PanelUI", "PoolMng", "ComboDisplay", "KillDisplay", "PlayerFX", "SortMng", "ShopUI", "ShowMask", "SubBtnsUI", "TipPanelUI", "Types", "BossProgress", "ButtonScaler1", "DeathUI", "GameOverUI", "HomeUI1", "InGameUI", "WaveProgress", "WaveUI", "buybox", "camera", "heroPanelUI", "lang", "message", "MainMenu", "MenuSidebar", "TabCtrl", "upgradePanel" ]);