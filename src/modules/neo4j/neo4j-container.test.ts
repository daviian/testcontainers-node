import neo4j from "neo4j-driver";
import { Neo4jContainer } from "./neo4j-container";

describe("Neo4jContainer", () => {
  jest.setTimeout(120000);

  it("should create a person node", async () => {
    const container = await new Neo4jContainer().start();

    const driver = neo4j.driver(
      container.getBoltUri(),
      neo4j.auth.basic(container.getUsername(), container.getPassword())
    );

    const session = driver.session();
    const personName = "Chris";

    try {
      const result = await session.run("CREATE (a:Person {name: $name}) RETURN a", { name: personName });

      const singleRecord = result.records[0];
      const node = singleRecord.get(0);

      expect(node.properties.name).toBe(personName);
    } finally {
      await session.close();
      await driver.close();
      await container.stop();
    }
  });

  it("should connect with custom password", async () => {
    const container = await new Neo4jContainer().withPassword("xyz1234@!").start();

    const driver = neo4j.driver(
      container.getBoltUri(),
      neo4j.auth.basic(container.getUsername(), container.getPassword())
    );

    const session = driver.session();
    const personName = "Chris";

    try {
      const result = await session.run("CREATE (a:Person {name: $name}) RETURN a", { name: personName });

      const singleRecord = result.records[0];
      const node = singleRecord.get(0);

      expect(node.properties.name).toBe(personName);
    } finally {
      await session.close();
      await driver.close();
      await container.stop();
    }
  });

  it("should have APOC plugin installed", async () => {
    const container = await new Neo4jContainer().withApoc().start();

    const driver = neo4j.driver(
      container.getBoltUri(),
      neo4j.auth.basic(container.getUsername(), container.getPassword())
    );

    const session = driver.session();

    try {
      const result = await session.run("CALL apoc.help('text')");

      const singleRecord = result.records[0];
      expect(singleRecord.length).toBeGreaterThan(0);
    } finally {
      await session.close();
      await driver.close();
      await container.stop();
    }
  });
});