'use strict'

/* eslint camelcase: 0 */

/* eslint-disable no-unused-vars */
import * as t from './types'
/* eslint-enable no-unused-vars */

function _A (...aggregations: any[]): any {
  return {
    aggs: Object.assign.apply(null, aggregations.filter(falsy))
  }
}

interface Aggregations {
  (...aggregations: any[]): any
  [name: string]: {
    // add aggregations to a parent aggregation
    aggs(...aggregations: any[]): t.Aggregation
    // Metric aggregations
    avg(opts: any): t.Aggregation
    weightedAvg(opts: any): t.Aggregation
    cardinality(opts: any): t.Aggregation
    extendedStats(opts: any): t.Aggregation
    geoBounds(opts: any): t.Aggregation
    geoCentroid(opts: any): t.Aggregation
    max(opts: any): t.Aggregation
    min(opts: any): t.Aggregation
    percentiles(opts: any): t.Aggregation
    percentileRanks(opts: any): t.Aggregation
    scriptedMetric(opts: any): t.Aggregation
    stats(opts: any): t.Aggregation
    sum(opts: any): t.Aggregation
    topHits(opts: any): t.Aggregation
    valueCount(opts: any): t.Aggregation
    medianAbsoluteDeviation(opts: any): t.Aggregation
    // Buckets aggregations
    adjacencyMatrix(opts: any, ...aggregations: any[]): t.Aggregation
    autoDateHistogram(opts: any, ...aggregations: any[]): t.Aggregation
    children(opts: any, ...aggregations: any[]): t.Aggregation
    composite(opts: any, ...aggregations: any[]): t.Aggregation
    dateHistogram(opts: any, ...aggregations: any[]): t.Aggregation
    dateRange(opts: any, ...aggregations: any[]): t.Aggregation
    diversifiedSampler(opts: any, ...aggregations: any[]): t.Aggregation
    filter(opts: any, ...aggregations: any[]): t.Aggregation
    filters(opts: any, ...aggregations: any[]): t.Aggregation
    geoDistance(opts: any, ...aggregations: any[]): t.Aggregation
    geohashGrid(opts: any, ...aggregations: any[]): t.Aggregation
    geotileGrid(opts: any, ...aggregations: any[]): t.Aggregation
    global(opts: any, ...aggregations: any[]): t.Aggregation
    histogram(opts: any, ...aggregations: any[]): t.Aggregation
    ipRange(opts: any, ...aggregations: any[]): t.Aggregation
    missing(opts: any, ...aggregations: any[]): t.Aggregation
    nested(opts: any, ...aggregations: any[]): t.Aggregation
    parent(opts: any, ...aggregations: any[]): t.Aggregation
    range(opts: any, ...aggregations: any[]): t.Aggregation
    reverseNested(opts: any, ...aggregations: any[]): t.Aggregation
    sampler(opts: any, ...aggregations: any[]): t.Aggregation
    significantTerms(opts: any, ...aggregations: any[]): t.Aggregation
    significantText(opts: any, ...aggregations: any[]): t.Aggregation
    terms(opts: any, ...aggregations: any[]): t.Aggregation
    maxBucket(opts: any, ...aggregations: any[]): t.Aggregation
  }
}

const aggregations = {
  get: function (target, name) {
    return {
      // add aggregations to a parent aggregation
      aggs (...aggregations: any[]): t.Aggregation {
        return updateAggsObject(name, aggregations)
      },

      // Metric aggregations
      avg (opts: any): t.Aggregation {
        return generateAggsObject('avg', name, opts)
      },

      weightedAvg (opts: any): t.Aggregation {
        return generateAggsObject('weighted_avg', name, opts)
      },

      cardinality (opts: any): t.Aggregation {
        return generateAggsObject('cardinality', name, opts)
      },

      extendedStats (opts: any): t.Aggregation {
        return generateAggsObject('extended_stats', name, opts)
      },

      geoBounds (opts: any): t.Aggregation {
        return generateAggsObject('geo_bounds', name, opts)
      },

      geoCentroid (opts: any): t.Aggregation {
        return generateAggsObject('geo_centroid', name, opts)
      },

      max (opts: any): t.Aggregation {
        return generateAggsObject('max', name, opts)
      },

      min (opts: any): t.Aggregation {
        return generateAggsObject('min', name, opts)
      },

      percentiles (opts: any): t.Aggregation {
        return generateAggsObject('percentiles', name, opts)
      },

      percentileRanks (opts: any): t.Aggregation {
        return generateAggsObject('percentile_ranks', name, opts)
      },

      scriptedMetric (opts: any): t.Aggregation {
        return generateAggsObject('scripted_metric', name, opts)
      },

      stats (opts: any): t.Aggregation {
        return generateAggsObject('stats', name, opts)
      },

      sum (opts: any): t.Aggregation {
        return generateAggsObject('sum', name, opts)
      },

      topHits (opts: any): t.Aggregation {
        return generateAggsObject('top_hits', name, opts)
      },

      valueCount (opts: any): t.Aggregation {
        return generateAggsObject('value_count', name, opts)
      },

      medianAbsoluteDeviation (opts: any): t.Aggregation {
        return generateAggsObject('median_absolute_deviation', name, opts)
      },

      // Buckets aggregations
      adjacencyMatrix (opts: any, ...aggregations: any[]): t.Aggregation {
        return generateAggsObject('adjacency_matrix', name, opts, aggregations)
      },

      autoDateHistogram (opts: any, ...aggregations: any[]): t.Aggregation {
        return generateAggsObject('auto_date_histogram', name, opts, aggregations)
      },

      children (opts: any, ...aggregations: any[]): t.Aggregation {
        return generateAggsObject('children', name, opts, aggregations)
      },

      composite (opts: any, ...aggregations: any[]): t.Aggregation {
        return generateAggsObject('composite', name, opts, aggregations)
      },

      dateHistogram (opts: any, ...aggregations: any[]): t.Aggregation {
        return generateAggsObject('date_histogram', name, opts, aggregations)
      },

      dateRange (opts: any, ...aggregations: any[]): t.Aggregation {
        return generateAggsObject('date_range', name, opts, aggregations)
      },

      diversifiedSampler (opts: any, ...aggregations: any[]): t.Aggregation {
        return generateAggsObject('diversified_sampler', name, opts, aggregations)
      },

      filter (opts: any, ...aggregations: any[]): t.Aggregation {
        return generateAggsObject('filter', name, opts, aggregations)
      },

      filters (opts: any, ...aggregations: any[]): t.Aggregation {
        return generateAggsObject('filters', name, opts, aggregations)
      },

      geoDistance (opts: any, ...aggregations: any[]): t.Aggregation {
        return generateAggsObject('geo_distance', name, opts, aggregations)
      },

      geohashGrid (opts: any, ...aggregations: any[]): t.Aggregation {
        return generateAggsObject('geohash_grid', name, opts, aggregations)
      },

      geotileGrid (opts: any, ...aggregations: any[]): t.Aggregation {
        return generateAggsObject('geotile_grid', name, opts, aggregations)
      },

      global (opts: any, ...aggregations: any[]): t.Aggregation {
        return generateAggsObject('global', name, opts, aggregations)
      },

      histogram (opts: any, ...aggregations: any[]): t.Aggregation {
        return generateAggsObject('histogram', name, opts, aggregations)
      },

      ipRange (opts: any, ...aggregations: any[]): t.Aggregation {
        return generateAggsObject('ip_range', name, opts, aggregations)
      },

      missing (opts: any, ...aggregations: any[]): t.Aggregation {
        return generateAggsObject('missing', name, opts, aggregations)
      },

      nested (opts: any, ...aggregations: any[]): t.Aggregation {
        return generateAggsObject('nested', name, opts, aggregations)
      },

      parent (opts: any, ...aggregations: any[]): t.Aggregation {
        return generateAggsObject('parent', name, opts, aggregations)
      },

      range (opts: any, ...aggregations: any[]): t.Aggregation {
        return generateAggsObject('range', name, opts, aggregations)
      },

      reverseNested (opts: any, ...aggregations: any[]): t.Aggregation {
        return generateAggsObject('reverse_nested', name, opts, aggregations)
      },

      sampler (opts: any, ...aggregations: any[]): t.Aggregation {
        return generateAggsObject('sampler', name, opts, aggregations)
      },

      significantTerms (opts: any, ...aggregations: any[]): t.Aggregation {
        return generateAggsObject('significant_terms', name, opts, aggregations)
      },

      significantText (opts: any, ...aggregations: any[]): t.Aggregation {
        return generateAggsObject('significant_text', name, opts, aggregations)
      },

      terms (opts: any, ...aggregations: any[]): t.Aggregation {
        return generateAggsObject('terms', name, opts, aggregations)
      },

      maxBucket (opts: any, ...aggregations: any[]): t.Aggregation {
        return generateAggsObject('max_bucket', name, opts, aggregations)
      }
    }
  }
}

const A = new Proxy(_A, aggregations) as Aggregations

function generateAggsObject (type: string, name: string, opts: any = {}, aggregations: any[] = []): t.Aggregation {
  if (typeof opts === 'string') {
    opts = { field: opts }
  }
  if (aggregations.length > 0) {
    return {
      [name]: {
        [type]: opts,
        aggs: Object.assign.apply(null, aggregations.filter(falsy))
      }
    }
  } else {
    return {
      [name]: {
        [type]: opts
      }
    }
  }
}

function updateAggsObject (name: string, aggregations: any[]): t.Aggregation {
  const [main, ...others] = aggregations.filter(falsy)
  if (main.aggs !== undefined) {
    main.aggs[name].aggs = Object.assign(main.aggs[name].aggs || {}, ...others)
  } else {
    main[name].aggs = Object.assign(main[name].aggs || {}, ...others)
  }
  return main
}

function falsy (val: any): boolean {
  return !!val
}

export default A
