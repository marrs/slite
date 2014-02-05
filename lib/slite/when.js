// Async promises library.

// Iterate over an array with fnStep.
// fnStep takes an additional arg that can be used to register
// successful completion of the step or a failure, in which
// case the iterator will abort.
exports.iterator = function (arr, fnStep) {
  var done_action  = function() {};
  var abort_action = function() {};
  var fail_action  = function() {};
  var successCount = 0;
  var completeCount = 0;
  var progress = {
    done: function() {
      ++successCount;
      if (successCount == arr.length) {
        done_action();
        abort_action = function() {};
        fail_action = function() {};
      }
    },
    abort: function(err) {
      abort_action(err || null, completeCount + 1);
      done_action = function() {};
      fail_action = function() {};
    }
  }
  function iterate() {
    arr.forEach(function(i, val) {
      fnStep(i, val, progress);
      completeCount = i;
      if (completeCount === arr.length) {
        fail_action();
      }
    });
  }
  return {
    done: function(fn) {
      done_action = fn;
      return this;
    },
    aborted: function(fn) {
      abort_action = fn;
      return this;
    },
    failed: function(fn) {
      fail_action = fn;
      return this;
    },
    go: function() {
      iterate();
    }
  }
}
