const form = document.getElementById("form");

form.addEventListener("submit", getFiles);

async function getFiles(event) {
  event.preventDefault();

  const { teachers, file1, file2 } = this.elements;

  const data1 = await readFile(file1.files[0]).catch(console.error);
  const data2 = await readFile(file2.files[0]).catch(console.error);

  const students = getStudents(data1);
  const matrix = getMatrix(data2);

  const nodes = students.map((student) => student.id);
  const edges = getEdges(students, matrix);

  const tree = kruskal(nodes, edges);

  const graphNodes = students.map(({ id, area }) => ({
    id,
    label: `Student: ${id}\nArea: ${area}`,
  }));

  const graphEdges = tree
    .slice(0, tree.length - (teachers.value - 1))
    .map((edge) => ({
      from: edge.from,
      to: edge.to,
      label: edge.distance.toString(),
    }));

  showGraph(graphNodes, graphEdges);
}

function getEdges(student, matrix) {
  const list = [];

  for (let i = 0; i < student.length; i++)
    for (let j = i + 1; j < student.length; j++) {
      const n = Math.min(student[i].area - 1, student[j].area - 1);
      const m = Math.max(student[i].area - 1, student[j].area - 1);

      list.push({
        from: student[i].id,
        to: student[j].id,
        distance: matrix[n][m],
      });
    }

  return list;
}

async function readFile(file) {
  const reader = new FileReader();

  reader.readAsText(file);

  return new Promise((res, rej) => {
    reader.onload = (event) => res(event.target.result);
    reader.onerror = (error) => rej(error);
  });
}

function getStudents(data) {
  return data
    .split("\n")
    .map((tuple) => tuple.split("\t"))
    .map((list) => list.map((e) => +e))
    .map(([id, area]) => ({ id, area }));
}

function getMatrix(data) {
  return data
    .split("\n")
    .map((tuple) => tuple.split("\t"))
    .map((list) => list.map((item) => (item !== "" ? +item : null)));
}

function kruskal(nodes, edges) {
  const mst = [];

  let forest = nodes.map((node) => [node]);

  const sortedEdges = edges.sort((a, b) => b.distance - a.distance);

  while (forest.length > 1) {
    const edge = sortedEdges.pop();

    const tree1 = forest.filter((tree) => tree.includes(edge.from));
    const tree2 = forest.filter((tree) => tree.includes(edge.to));

    if (JSON.stringify(tree1) !== JSON.stringify(tree2)) {
      forest = forest.filter((tree) => ![tree1[0], tree2[0]].includes(tree));
      forest.push(tree1[0].concat(tree2[0]));
      mst.push(edge);
    }
  }

  return mst;
}

function showGraph(nodes, edges) {
  const container = document.getElementById("container");

  const data = {
    nodes: new vis.DataSet(nodes),
    edges: new vis.DataSet(edges),
  };

  const options = {
    layout: {
      improvedLayout: true,
    },
  };

  new vis.Network(container, data, options);
}
