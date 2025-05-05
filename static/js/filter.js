export const filterBy = (filter, query, array) => {
  const filtered = array.filter(it => it[filter]?.toLowerCase().includes(query.toLowerCase()))
  return filtered.map(it => {
    const highlightedHtml = it[filter]?.replace(new RegExp(query, 'ig'), `<mark>${query}</mark>`)
    return { ...it, query: highlightedHtml }
  })
}
