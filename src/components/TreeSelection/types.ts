import type {
  ImageSourcePropType,
  ImageStyle,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';

/**
 * Tree data types.
 * Including undefined as a type option allows for flexibility in the structure of GenericTreeDataType objects.
 */

interface GenericTreeDataType {
  [key: string]:
    | TreeDataTypes[]
    | string
    | number
    | boolean
    | undefined
    | TreeDataTypes;
}

export interface TreeDataTypes extends GenericTreeDataType {
  isExpanded?: boolean;
  isSelected?: boolean;
  parent?: TreeDataTypes;
}

/**
 * Tree data prop types.
 */
export type TreeSelectTypes = Partial<{
  data: TreeDataTypes[];
  childKey: string;
  titleKey: string;
  renderArrowOpen: JSX.Element;
  renderArrowClosed: JSX.Element;
  renderSelect: JSX.Element;
  renderUnSelect: JSX.Element;
  autoSelectParents: boolean;
  autoSelectChildren: boolean;
  autoExpandable: boolean;
  onParentPress: (item: TreeDataTypes) => void;
  onChildPress: (item: TreeDataTypes) => void;
  onCheckBoxPress: (item: TreeDataTypes[]) => void;
  containerStyles: StyleProp<ViewStyle>;
  leftIconStyles: StyleProp<ImageStyle>;
  rightIconStyles: StyleProp<ImageStyle>;
  parentContainerStyles: StyleProp<ViewStyle>;
  parentTextStyles: StyleProp<TextStyle>;
  childContainerStyles: StyleProp<ViewStyle>;
  childTextStyles: StyleProp<TextStyle>;
}>;

export interface CustomImageProps {
  source: ImageSourcePropType;
  style?: StyleProp<ImageStyle>;
}

export interface ChildItemTypes {
  item: TreeDataTypes;
  childContainerStyles: StyleProp<ViewStyle>;
  childTextStyles: StyleProp<TextStyle>;
  onPressCheckbox: (item: TreeDataTypes) => void;
  titleKey: string;
  onChildPress: (item: TreeDataTypes) => void;
  renderIcon: any;
}

export interface ParentItemTypes {
  item: TreeDataTypes;
  parentContainerStyles: StyleProp<ViewStyle>;
  parentTextStyles: StyleProp<TextStyle>;
  onPressCheckbox: (item: TreeDataTypes) => void;
  showChildren: (item: TreeDataTypes) => void;
  renderIcon: any;
  renderOpenCloseIcon: any;
  titleKey: string;
  childKey: string;
}

export interface TreeSelectHookTypes {
  data: TreeDataTypes[] | undefined;
  onCheckBoxPress: (item: TreeDataTypes[]) => void;
  onParentPress: (item: TreeDataTypes) => void;
  autoSelectParents: boolean;
  autoSelectChildren: boolean;
  childKey: string;
  autoExpandable: boolean;
}
