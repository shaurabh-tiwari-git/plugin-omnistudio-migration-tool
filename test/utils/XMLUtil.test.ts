import { expect } from 'chai';
import { xmlUtil } from '../../src/utils/XMLUtil';
import { Flexipage } from '../../src/migration/interfaces';

describe('xmlUtil', () => {
  it('parses XML with attributes and arrays', () => {
    const xml = `<?xml version="1.0"?>
      <FlexiPage name="TestPage">
        <flexiPageRegions>
          <itemInstances>
            <componentInstance componentName="foo">
              <componentInstanceProperties>
                <property name="target" value="bar"/>
                <property name="other" value="baz"/>
              </componentInstanceProperties>
            </componentInstance>
          </itemInstances>
          <itemInstances>
            <componentInstance componentName="bar">
              <componentInstanceProperties>
                <property name="target" value="qux"/>
              </componentInstanceProperties>
            </componentInstance>
          </itemInstances>
        </flexiPageRegions>
      </FlexiPage>`;
    const result = xmlUtil.parse(xml);
    expect(result).to.have.property('FlexiPage');
    expect((result as { FlexiPage: Flexipage }).FlexiPage).to.have.property('@name', 'TestPage');
    expect((result as { FlexiPage: Flexipage }).FlexiPage.flexiPageRegions)
      .to.be.an('array')
      .with.length(1);
    expect((result as { FlexiPage: Flexipage }).FlexiPage.flexiPageRegions[0].itemInstances)
      .to.be.an('array')
      .with.length(2);
    expect(
      (result as { FlexiPage: Flexipage }).FlexiPage.flexiPageRegions[0].itemInstances[0].componentInstance[
        '@componentName'
      ]
    ).to.equal('foo');
    expect(
      (result as { FlexiPage: Flexipage }).FlexiPage.flexiPageRegions[0].itemInstances[1].componentInstance[
        '@componentName'
      ]
    ).to.equal('bar');
  });

  it('builds XML from JS object with attributes and arrays', () => {
    const obj = {
      FlexiPage: {
        '@name': 'TestPage',
        flexiPageRegions: [
          {
            itemInstances: [
              {
                componentInstance: {
                  '@componentName': 'foo',
                  componentInstanceProperties: {
                    property: [
                      { '@name': 'target', '@value': 'bar' },
                      { '@name': 'other', '@value': 'baz' },
                    ],
                  },
                },
              },
              {
                componentInstance: {
                  '@componentName': 'bar',
                  componentInstanceProperties: {
                    property: [{ '@name': 'target', '@value': 'qux' }],
                  },
                },
              },
            ],
          },
        ],
      },
    };
    const xml = xmlUtil.build(obj);
    expect(xml).to.include('<FlexiPage');
    expect(xml).to.include('name="TestPage"');
    expect(xml).to.include('<flexiPageRegions>');
    expect(xml).to.include('<itemInstances>');
    expect(xml).to.include('componentName="foo"');
    expect(xml).to.include('componentName="bar"');
    expect(xml).to.include('name="target" value="bar"');
    expect(xml).to.include('name="other" value="baz"');
  });

  it('round-trips XML: build(parse(xml)) ≈ xml', () => {
    const xml = `<?xml version="1.0"?>
      <FlexiPage name="TestPage">
        <flexiPageRegions>
          <itemInstances>
            <componentInstance componentName="foo">
              <componentInstanceProperties>
                <property name="target" value="bar"/>
                <property name="other" value="baz"/>
              </componentInstanceProperties>
            </componentInstance>
          </itemInstances>
        </flexiPageRegions>
      </FlexiPage>`;
    const obj = xmlUtil.parse(xml);
    const xml2 = xmlUtil.build(obj);
    // Should contain the same tags and attributes
    expect(xml2).to.include('<FlexiPage');
    expect(xml2).to.include('name="TestPage"');
    expect(xml2).to.include('<flexiPageRegions>');
    expect(xml2).to.include('<itemInstances>');
    expect(xml2).to.include('componentName="foo"');
    expect(xml2).to.include('name="target" value="bar"');
    expect(xml2).to.include('name="other" value="baz"');
  });

  it('handles empty and minimal XML', () => {
    const xml = '<FlexiPage></FlexiPage>';
    const obj = xmlUtil.parse(xml);
    expect(obj).to.have.property('FlexiPage');
    const xml2 = xmlUtil.build(obj);
    expect(xml2).to.include('<FlexiPage');
  });
});
