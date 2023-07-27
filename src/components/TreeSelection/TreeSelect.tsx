import {
  cloneDeep,
  isArray,
  isEmpty,
  isEqual,
  isNull,
  isString,
  isUndefined,
} from 'lodash';
import React, { useEffect, useCallback } from 'react';
import { FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import { Icons } from '../../assets';
import { Strings } from '../../constants';
import styles from './styles';
import type {
  ChildItemTypes,
  CustomImageProps,
  InnerFlatListTypes,
  ParentItemTypes,
  TreeDataTypes,
  TreeSelectTypes,
} from './types';
import useTreeSelect from './useTreeSelect';

const CustomImage = React.memo(({ source, style }: CustomImageProps) => {
  return <Image source={source} style={[styles.iconView, style]} />;
});

const ParentItem = ({
  item,
  parentContainerStyles,
  parentTextStyles,
  onPressCheckbox,
  showChildren,
  renderIcon,
  titleKey,
  childKey,
  touchableActiveOpacity,
}: ParentItemTypes) => (
  <View style={styles.renderContainer}>
    <TouchableOpacity
      activeOpacity={touchableActiveOpacity}
      testID={`${item[titleKey]}-parent`}
      onPress={() => showChildren(item)}
      style={parentContainerStyles ?? styles.parentStyles}>
      <TouchableOpacity
        activeOpacity={touchableActiveOpacity}
        testID={`${item[titleKey]}-press`}
        onPress={() => {
          onPressCheckbox(item);
        }}
        style={styles.chevronContainer}>
        {renderIcon(item?.isSelected ?? false, 'child')}
      </TouchableOpacity>
      <Text style={[styles.text, parentTextStyles]}>
        {item[titleKey] as string}
      </Text>
      {Array.isArray(item[childKey]) &&
        (item[childKey] as Array<TreeDataTypes>)?.length > 0 && (
          <View style={styles.chevronContainer}>
            {renderIcon(item?.isExpanded ?? false)}
          </View>
        )}
    </TouchableOpacity>
  </View>
);

const ChildItem = ({
  item,
  childContainerStyles,
  childTextStyles,
  onPressCheckbox,
  titleKey,
  onChildPress,
  renderIcon,
  touchableActiveOpacity,
}: ChildItemTypes) => (
  <TouchableOpacity
    activeOpacity={touchableActiveOpacity}
    testID={`${item[titleKey]}-child`}
    style={[styles.childrenContainerStyles, childContainerStyles]}
    onPress={() => onChildPress(item)}>
    <TouchableOpacity
      activeOpacity={touchableActiveOpacity}
      onPress={() => {
        onPressCheckbox(item);
      }}
      testID={`${item[titleKey]}-press`}
      style={styles.chevronContainer}>
      {renderIcon(item?.isSelected ?? false, 'child')}
    </TouchableOpacity>
    <Text style={[styles.text, childTextStyles]}>
      {item[titleKey] as string}
    </Text>
  </TouchableOpacity>
);

const InnerFlatList = React.memo(
  ({ itemSelf, childKey, renderOtherItem }: InnerFlatListTypes) => (
    <View style={styles.innerContainer}>
      <FlatList
        data={itemSelf[childKey] as Array<TreeDataTypes>}
        renderItem={({ item }: { item: TreeDataTypes }) => {
          return renderOtherItem(item, itemSelf);
        }}
      />
    </View>
  )
);

const TreeSelect = ({
  data,
  onParentPress = (_value: {}) => {},
  onChildPress = (_value: {}) => {},
  onCheckBoxPress = ([]) => {},
  leftIconStyles,
  rightIconStyles,
  parentContainerStyles,
  childContainerStyles,
  parentTextStyles,
  childTextStyles,
  autoSelectParents = true,
  autoSelectChildren = true,
  autoExpandable = false,
  titleKey = 'title',
  childKey = 'data',
  renderArrowOpen,
  renderArrowClosed,
  renderSelect,
  renderUnSelect,
  touchableActiveOpacity = 0.7,
  flatListProps,
}: TreeSelectTypes) => {
  const { listData, setListData, refresh, onPressCheckbox, showChildren } =
    useTreeSelect({
      data,
      onCheckBoxPress,
      autoSelectParents,
      autoSelectChildren,
      childKey,
      autoExpandable,
      onParentPress,
    });

  useEffect(() => {
    data && setListData(cloneDeep(data));
  }, [data, setListData]);

  useEffect(() => {
    isEqual(childKey, titleKey) && console.warn(Strings.samePropsError);
  }, [childKey, titleKey]);

  const renderIcon = (
    status: boolean,
    type: string = 'parent'
  ): JSX.Element => {
    const isChild: boolean = type === 'child';
    let selectIcon: { custom: JSX.Element | undefined; default: number };

    if (isChild) {
      selectIcon = status
        ? { custom: renderSelect, default: Icons.checkboxChecked }
        : { custom: renderUnSelect, default: Icons.checkboxUnchecked };
    } else {
      selectIcon = status
        ? { custom: renderArrowOpen, default: Icons.open }
        : { custom: renderArrowClosed, default: Icons.close };
    }

    if (React.isValidElement(selectIcon.custom)) {
      return selectIcon.custom;
    }

    const iconStyle = isChild ? rightIconStyles : leftIconStyles;
    return <CustomImage source={selectIcon.default} style={iconStyle} />;
  };

  /**
   * This is Render tree @RecursiveFunction which calls itself if found any children.
   * @FlatList is used to re-render the tree.
   * This @FlatList is divided into 3 Parts:
   *
   *    Part I - In this part all the elements are rendered which have the children.
   *             All The styling for the parent @Items will goes here.
   *
   *    Part II - In this part all the elements are rendered which does not have the children.
   *             All The styling for the leaf children @Items will goes here.
   *
   *    Part III - If any @Item having children's will call the @RecursiveFunction and re-render FlatList.
   *               All the styling between @children and @parent goes here.
   */

  const renderOtherItem = useCallback(
    (item: TreeDataTypes, itemData: TreeDataTypes) => {
      if (!item.parent) {
        item.parent = itemData;
      }
      return renderTree({ item });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refresh]
  );

  const renderTree = useCallback(
    ({ item }: { item: TreeDataTypes }) => {
      if (isUndefined(item.isExpanded)) {
        item.isExpanded = false;
      }

      if (isUndefined(item.isSelected)) {
        item.isSelected = false;
      }

      const hasTitle = isString(item?.[titleKey]);
      const hasChildren = isArray(item?.[childKey]) && !isEmpty(item[childKey]);

      return (
        <>
          {/* Part I. */}
          {hasTitle && hasChildren && (
            <ParentItem
              {...{
                item,
                parentContainerStyles,
                parentTextStyles,
                onPressCheckbox,
                showChildren,
                renderIcon,
                titleKey,
                childKey,
                touchableActiveOpacity,
              }}
            />
          )}
          {/* Part II. */}
          {hasTitle && isEmpty(item?.[childKey]) && (
            <ChildItem
              {...{
                item,
                childContainerStyles,
                childTextStyles,
                onPressCheckbox,
                titleKey,
                onChildPress,
                renderIcon,
                touchableActiveOpacity,
              }}
            />
          )}
          {/* Part III. */}
          {!isNull(item?.[childKey]) && item.isExpanded && (
            <InnerFlatList
              itemSelf={item}
              childKey={childKey}
              renderOtherItem={renderOtherItem}
            />
          )}
        </>
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onChildPress, onPressCheckbox]
  );

  /**
   * This is the return function which renders the JSX.
   */
  return (
    <FlatList
      showsVerticalScrollIndicator={false}
      {...flatListProps}
      contentContainerStyle={styles.containerStyle}
      data={listData}
      renderItem={renderTree}
      keyExtractor={(_item, index) => index.toString()}
      extraData={refresh}
    />
  );
};

export default TreeSelect;
